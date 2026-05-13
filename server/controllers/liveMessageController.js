const { sql, getPool } = require('../utils/liveDb');

function normalizeId(value) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function getUserId(req) {
  return normalizeId(req.user?.UserID) ||
    normalizeId(req.user?.id) ||
    normalizeId(req.headers['x-user-id']) ||
    normalizeId(req.query.userId) ||
    normalizeId(req.body?.userId) ||
    normalizeId(req.body?.senderId);
}

async function listConversations(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(400).json({ message: 'Missing userId. Send x-user-id header or ?userId=1.' });

    const pool = await getPool(req);
    const result = await pool.request()
      .input('UserID', sql.Int, userId)
      .query(`
        SELECT
          c.ConvID, c.Type, c.TripID, c.Title, c.CreatedAt, cp.LastReadAt,
          lm.MessageText AS LastMessageText, lm.SentAt AS LastMessageAt, lm.SenderID AS LastMessageSenderID,
          otherUser.UserID AS OtherUserID, otherUser.FullName AS OtherUserName, otherUser.Email AS OtherUserEmail,
          (
            SELECT COUNT(*)
            FROM Messages unread
            WHERE unread.ConvID = c.ConvID
              AND unread.SenderID <> @UserID
              AND unread.IsDeleted = 0
              AND (cp.LastReadAt IS NULL OR unread.SentAt > cp.LastReadAt)
          ) AS UnreadCount
        FROM Conversations c
        INNER JOIN ConversationParticipants cp ON cp.ConvID = c.ConvID AND cp.UserID = @UserID
        OUTER APPLY (
          SELECT TOP 1 m.MessageText, m.SentAt, m.SenderID
          FROM Messages m
          WHERE m.ConvID = c.ConvID AND m.IsDeleted = 0
          ORDER BY m.SentAt DESC, m.MessageID DESC
        ) lm
        OUTER APPLY (
          SELECT TOP 1
            u.UserID,
            COALESCE(u.FullName, u.Name, u.Username, CONCAT('User ', u.UserID)) AS FullName,
            u.Email
          FROM ConversationParticipants cp2
          LEFT JOIN Users u ON u.UserID = cp2.UserID
          WHERE cp2.ConvID = c.ConvID AND cp2.UserID <> @UserID
          ORDER BY cp2.JoinedAt ASC
        ) otherUser
        ORDER BY COALESCE(lm.SentAt, c.CreatedAt) DESC;
      `);

    res.json({ conversations: result.recordset });
  } catch (err) {
    console.error('listConversations error:', err);
    res.status(500).json({ message: 'Could not load conversations', detail: err.message });
  }
}

async function getMessages(req, res) {
  try {
    const userId = getUserId(req);
    const convId = normalizeId(req.params.convId);
    if (!userId) return res.status(400).json({ message: 'Missing userId. Send x-user-id header or ?userId=1.' });
    if (!convId) return res.status(400).json({ message: 'Invalid conversation id' });

    const pool = await getPool(req);
    const access = await pool.request()
      .input('ConvID', sql.Int, convId)
      .input('UserID', sql.Int, userId)
      .query(`SELECT 1 AS Allowed FROM ConversationParticipants WHERE ConvID = @ConvID AND UserID = @UserID;`);

    if (!access.recordset.length) return res.status(403).json({ message: 'You are not a participant in this conversation' });

    const result = await pool.request()
      .input('ConvID', sql.Int, convId)
      .query(`
        SELECT
          m.MessageID, m.ConvID, m.SenderID,
          COALESCE(u.FullName, u.Name, u.Username, CONCAT('User ', m.SenderID)) AS SenderName,
          m.MessageText, m.MediaURL, m.MessageType, m.SentAt, m.IsDeleted
        FROM Messages m
        LEFT JOIN Users u ON u.UserID = m.SenderID
        WHERE m.ConvID = @ConvID AND m.IsDeleted = 0
        ORDER BY m.SentAt ASC, m.MessageID ASC;
      `);

    await pool.request()
      .input('ConvID', sql.Int, convId)
      .input('UserID', sql.Int, userId)
      .query(`UPDATE ConversationParticipants SET LastReadAt = SYSUTCDATETIME() WHERE ConvID = @ConvID AND UserID = @UserID;`);

    res.json({ messages: result.recordset });
  } catch (err) {
    console.error('getMessages error:', err);
    res.status(500).json({ message: 'Could not load messages', detail: err.message });
  }
}

async function findOrCreateDirectConversation(pool, userA, userB, tripId = null) {
  const existing = await pool.request()
    .input('UserA', sql.Int, userA)
    .input('UserB', sql.Int, userB)
    .query(`
      SELECT TOP 1 c.ConvID
      FROM Conversations c
      INNER JOIN ConversationParticipants a ON a.ConvID = c.ConvID AND a.UserID = @UserA
      INNER JOIN ConversationParticipants b ON b.ConvID = c.ConvID AND b.UserID = @UserB
      WHERE c.Type = 'direct'
      ORDER BY c.CreatedAt DESC;
    `);

  if (existing.recordset.length) return existing.recordset[0].ConvID;

  const tx = new sql.Transaction(pool);
  await tx.begin();
  try {
    const createConv = await new sql.Request(tx)
      .input('TripID', sql.Int, tripId)
      .query(`
        INSERT INTO Conversations (Type, TripID, CreatedAt)
        OUTPUT INSERTED.ConvID
        VALUES ('direct', @TripID, SYSUTCDATETIME());
      `);
    const convId = createConv.recordset[0].ConvID;
    await new sql.Request(tx)
      .input('ConvID', sql.Int, convId)
      .input('UserA', sql.Int, userA)
      .input('UserB', sql.Int, userB)
      .query(`
        INSERT INTO ConversationParticipants (ConvID, UserID, JoinedAt, LastReadAt)
        VALUES (@ConvID, @UserA, SYSUTCDATETIME(), SYSUTCDATETIME()),
               (@ConvID, @UserB, SYSUTCDATETIME(), NULL);
      `);
    await tx.commit();
    return convId;
  } catch (err) {
    await tx.rollback();
    throw err;
  }
}

async function createDirectConversation(req, res) {
  try {
    const userId = getUserId(req);
    const otherUserId = normalizeId(req.body?.otherUserId || req.body?.receiverId);
    const tripId = normalizeId(req.body?.tripId);
    if (!userId) return res.status(400).json({ message: 'Missing userId. Send x-user-id header or body userId.' });
    if (!otherUserId) return res.status(400).json({ message: 'Missing otherUserId' });
    if (userId === otherUserId) return res.status(400).json({ message: 'Cannot create a direct chat with yourself' });

    const pool = await getPool(req);
    const convId = await findOrCreateDirectConversation(pool, userId, otherUserId, tripId);
    res.status(201).json({ convId });
  } catch (err) {
    console.error('createDirectConversation error:', err);
    res.status(500).json({ message: 'Could not create conversation', detail: err.message });
  }
}

async function saveMessage(pool, { convId, senderId, messageText, mediaUrl = null, messageType = 'text' }) {
  const cleanText = String(messageText || '').trim();
  if (!cleanText && !mediaUrl) throw new Error('Message cannot be empty');

  const access = await pool.request()
    .input('ConvID', sql.Int, convId)
    .input('SenderID', sql.Int, senderId)
    .query(`SELECT 1 AS Allowed FROM ConversationParticipants WHERE ConvID = @ConvID AND UserID = @SenderID;`);

  if (!access.recordset.length) throw new Error('Sender is not a participant in this conversation');

  const result = await pool.request()
    .input('ConvID', sql.Int, convId)
    .input('SenderID', sql.Int, senderId)
    .input('MessageText', sql.NVarChar(sql.MAX), cleanText || null)
    .input('MediaURL', sql.NVarChar(500), mediaUrl)
    .input('MessageType', sql.NVarChar(20), messageType)
    .query(`
      INSERT INTO Messages (ConvID, SenderID, MessageText, MediaURL, MessageType, SentAt, IsDeleted)
      OUTPUT INSERTED.MessageID, INSERTED.ConvID, INSERTED.SenderID, INSERTED.MessageText,
             INSERTED.MediaURL, INSERTED.MessageType, INSERTED.SentAt, INSERTED.IsDeleted
      VALUES (@ConvID, @SenderID, @MessageText, @MediaURL, @MessageType, SYSUTCDATETIME(), 0);
    `);

  return result.recordset[0];
}

async function sendMessage(req, res) {
  try {
    const senderId = getUserId(req);
    const convId = normalizeId(req.params.convId || req.body?.convId);
    const messageText = req.body?.messageText || req.body?.text;
    const mediaUrl = req.body?.mediaUrl || null;
    const messageType = req.body?.messageType || (mediaUrl ? 'image' : 'text');
    if (!senderId) return res.status(400).json({ message: 'Missing senderId. Send x-user-id header or body senderId.' });
    if (!convId) return res.status(400).json({ message: 'Invalid conversation id' });

    const pool = await getPool(req);
    const message = await saveMessage(pool, { convId, senderId, messageText, mediaUrl, messageType });

    const io = req.app.get('io');
    if (io) io.to(`conversation:${convId}`).emit('new_message', message);
    res.status(201).json({ message });
  } catch (err) {
    console.error('sendMessage error:', err);
    res.status(500).json({ message: 'Could not send message', detail: err.message });
  }
}

module.exports = {
  listConversations,
  getMessages,
  createDirectConversation,
  sendMessage,
  saveMessage,
  getUserId,
  findOrCreateDirectConversation,
};
