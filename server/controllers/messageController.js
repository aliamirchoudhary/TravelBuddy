const { sql, poolPromise } = require('../db');

function getUserId(req) {
  return req.user?.UserID || req.user?.id || req.user?.userId || null;
}

function requireUser(req, res) {
  const userId = getUserId(req);

  if (!userId) {
    res.status(401).json({ message: 'Login required.' });
    return null;
  }

  return Number(userId);
}

async function canMessage(poolOrTransaction, userId, otherUserId) {
  const request = poolOrTransaction instanceof sql.Transaction
    ? new sql.Request(poolOrTransaction)
    : poolOrTransaction.request();

  const result = await request
    .input('uid', sql.Int, Number(userId))
    .input('oid', sql.Int, Number(otherUserId))
    .query(`
      SELECT 1 AS Allowed
      FROM dbo.UserFollows
      WHERE FollowerID = @uid AND FollowingID = @oid
      UNION
      SELECT 1
      FROM dbo.BuddyConnections
      WHERE (User1ID = @uid AND User2ID = @oid)
         OR (User1ID = @oid AND User2ID = @uid);
    `);

  return result.recordset.length > 0;
}

async function getDirectConversationPeer(pool, convId, currentUserId) {
  const result = await pool.request()
    .input('ConvID', sql.Int, Number(convId))
    .input('UserID', sql.Int, Number(currentUserId))
    .query(`
      SELECT TOP 1
        c.ConvID,
        c.Type,
        otherP.UserID AS OtherUserID
      FROM dbo.Conversations c
      INNER JOIN dbo.ConversationParticipants me
        ON me.ConvID = c.ConvID AND me.UserID = @UserID
      LEFT JOIN dbo.ConversationParticipants otherP
        ON otherP.ConvID = c.ConvID AND otherP.UserID <> @UserID
      WHERE c.ConvID = @ConvID;
    `);

  return result.recordset[0] || null;
}

async function assertCanUseConversation(pool, convId, currentUserId) {
  const peer = await getDirectConversationPeer(pool, convId, currentUserId);

  if (!peer) {
    return {
      ok: false,
      status: 403,
      message: 'You are not a participant in this conversation.',
    };
  }

  // For group conversations, basic participant access is enough for now.
  // Direct conversations require current user to follow or be buddies with the other participant.
  if (peer.Type === 'direct') {
    if (!peer.OtherUserID) {
      return {
        ok: false,
        status: 404,
        message: 'Conversation participant not found.',
      };
    }

    const allowed = await canMessage(pool, currentUserId, peer.OtherUserID);

    if (!allowed) {
      return {
        ok: false,
        status: 403,
        message: 'You can only message users you follow or are buddies with.',
      };
    }
  }

  return { ok: true, peer };
}

async function getUsers(req, res) {
  const userId = requireUser(req, res);
  if (!userId) return;

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('UserID', sql.Int, userId)
      .query(`
        SELECT DISTINCT
          u.UserID,
          u.Email,
          u.DisplayName,
          COALESCE(u.Avatar, N'🧳') AS Avatar,
          u.AvatarURL
        FROM dbo.Users u
        WHERE u.UserID IN (
          SELECT FollowingID FROM dbo.UserFollows WHERE FollowerID = @UserID
          UNION
          SELECT CASE WHEN User1ID = @UserID THEN User2ID ELSE User1ID END
          FROM dbo.BuddyConnections
          WHERE User1ID = @UserID OR User2ID = @UserID
        )
        AND u.UserID <> @UserID
        ORDER BY u.DisplayName ASC;
      `);

    res.json({ users: result.recordset });
  } catch (err) {
    console.error('[Messages:getUsers]', err);
    res.status(500).json({
      message: err.message || 'Could not load contacts.',
    });
  }
}

async function getConversations(req, res) {
  const userId = requireUser(req, res);
  if (!userId) return;

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('UserID', sql.Int, userId)
      .query(`
        SELECT
          c.ConvID,
          c.Type,
          c.TripID,
          c.CreatedAt,
          otherUser.UserID AS OtherUserID,
          otherUser.Email AS OtherUserEmail,
          COALESCE(otherUser.DisplayName, 'Unknown User') AS Title,
          COALESCE(otherUser.Avatar, N'🧳') AS Avatar,
          COALESCE(lastMsg.MessageText, 'No messages yet') AS LastMessage,
          COALESCE(lastMsg.SentAt, c.CreatedAt) AS LastMessageAt,
          CAST(0 AS INT) AS UnreadCount
        FROM dbo.Conversations c
        INNER JOIN dbo.ConversationParticipants me
          ON me.ConvID = c.ConvID AND me.UserID = @UserID
        OUTER APPLY (
          SELECT TOP 1 cp2.UserID
          FROM dbo.ConversationParticipants cp2
          WHERE cp2.ConvID = c.ConvID AND cp2.UserID <> @UserID
          ORDER BY cp2.UserID
        ) otherParticipant
        LEFT JOIN dbo.Users otherUser
          ON otherUser.UserID = otherParticipant.UserID
        OUTER APPLY (
          SELECT TOP 1 m.MessageText, m.SentAt
          FROM dbo.Messages m
          WHERE m.ConvID = c.ConvID AND ISNULL(m.IsDeleted, 0) = 0
          ORDER BY m.SentAt DESC
        ) lastMsg
        WHERE c.Type = 'direct'
          AND (
            EXISTS (SELECT 1 FROM dbo.UserFollows f WHERE f.FollowerID = @UserID AND f.FollowingID = otherParticipant.UserID)
            OR
            EXISTS (SELECT 1 FROM dbo.BuddyConnections bc WHERE (bc.User1ID = @UserID AND bc.User2ID = otherParticipant.UserID) OR (bc.User1ID = otherParticipant.UserID AND bc.User2ID = @UserID))
          )
        ORDER BY COALESCE(lastMsg.SentAt, c.CreatedAt) DESC;
      `);

    res.json({ conversations: result.recordset });
  } catch (err) {
    console.error('[Messages:getConversations]', err);
    res.status(500).json({ message: err.message || 'Could not load conversations.' });
  }
}

async function createDirectConversation(req, res) {
  const userId = requireUser(req, res);
  if (!userId) return;

  const otherUserId = Number(req.body.otherUserId || req.body.receiverId || req.body.participantId);

  if (!otherUserId || otherUserId === userId) {
    return res.status(400).json({ message: 'A valid other user is required.' });
  }

  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const otherExists = await new sql.Request(transaction)
      .input('OtherUserID', sql.Int, otherUserId)
      .query(`
        SELECT UserID, Email, DisplayName, Avatar
        FROM dbo.Users
        WHERE UserID = @OtherUserID;
      `);

    if (otherExists.recordset.length === 0) {
      await transaction.rollback();
      return res.status(404).json({ message: 'User not found.' });
    }

    const allowed = await canMessage(transaction, userId, otherUserId);

    if (!allowed) {
      await transaction.rollback();
      return res.status(403).json({
        message: 'You can only message users you follow or are buddies with.',
      });
    }

    const existing = await new sql.Request(transaction)
      .input('UserID', sql.Int, userId)
      .input('OtherUserID', sql.Int, otherUserId)
      .query(`
        SELECT TOP 1
          c.ConvID,
          c.Type,
          c.TripID,
          c.CreatedAt,
          u.UserID AS OtherUserID,
          u.Email AS OtherUserEmail,
          COALESCE(u.DisplayName, 'Unknown User') AS Title,
          COALESCE(u.Avatar, N'🧳') AS Avatar,
          'No messages yet' AS LastMessage,
          c.CreatedAt AS LastMessageAt,
          CAST(0 AS INT) AS UnreadCount
        FROM dbo.Conversations c
        INNER JOIN dbo.ConversationParticipants p1
          ON p1.ConvID = c.ConvID AND p1.UserID = @UserID
        INNER JOIN dbo.ConversationParticipants p2
          ON p2.ConvID = c.ConvID AND p2.UserID = @OtherUserID
        LEFT JOIN dbo.Users u
          ON u.UserID = @OtherUserID
        WHERE c.Type = 'direct'
        ORDER BY c.ConvID DESC;
      `);

    if (existing.recordset.length > 0) {
      await transaction.commit();
      return res.json({ conversation: existing.recordset[0], existed: true });
    }

    const convResult = await new sql.Request(transaction)
      .query(`
        INSERT INTO dbo.Conversations (Type)
        OUTPUT inserted.ConvID, inserted.Type, inserted.TripID, inserted.CreatedAt
        VALUES ('direct');
      `);

    const conversation = convResult.recordset[0];

    await new sql.Request(transaction)
      .input('ConvID', sql.Int, conversation.ConvID)
      .input('UserID', sql.Int, userId)
      .query(`
        INSERT INTO dbo.ConversationParticipants (ConvID, UserID)
        VALUES (@ConvID, @UserID);
      `);

    await new sql.Request(transaction)
      .input('ConvID', sql.Int, conversation.ConvID)
      .input('UserID', sql.Int, otherUserId)
      .query(`
        INSERT INTO dbo.ConversationParticipants (ConvID, UserID)
        VALUES (@ConvID, @UserID);
      `);

    await transaction.commit();

    const other = otherExists.recordset[0];

    res.status(201).json({
      conversation: {
        ...conversation,
        OtherUserID: other.UserID,
        OtherUserEmail: other.Email,
        Title: other.DisplayName || 'Unknown User',
        Avatar: other.Avatar || '🧳',
        LastMessage: 'No messages yet',
        LastMessageAt: conversation.CreatedAt,
        UnreadCount: 0,
      },
      existed: false,
    });
  } catch (err) {
    try {
      await transaction.rollback();
    } catch {}

    console.error('[Messages:createDirectConversation]', err);
    res.status(500).json({ message: err.message || 'Could not create conversation.' });
  }
}

async function createConversation(req, res) {
  return createDirectConversation(req, res);
}

async function getMessages(req, res) {
  const userId = requireUser(req, res);
  if (!userId) return;

  const convId = Number(req.params.convId);

  if (!convId) {
    return res.status(400).json({ message: 'Conversation ID is required.' });
  }

  try {
    const pool = await poolPromise;

    const permission = await assertCanUseConversation(pool, convId, userId);

    if (!permission.ok) {
      return res.status(permission.status).json({ message: permission.message });
    }

    const result = await pool.request()
      .input('ConvID', sql.Int, convId)
      .input('UserID', sql.Int, userId)
      .query(`
        SELECT
          m.MessageID,
          m.ConvID,
          m.SenderID,
          COALESCE(u.DisplayName, CONCAT('User ', m.SenderID)) AS SenderName,
          COALESCE(u.Avatar, N'🧳') AS SenderAvatar,
          m.MessageText,
          m.MediaURL,
          m.MessageType,
          m.SentAt,
          CASE WHEN m.SenderID = @UserID THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END AS IsMine
        FROM dbo.Messages m
        LEFT JOIN dbo.Users u ON u.UserID = m.SenderID
        WHERE m.ConvID = @ConvID AND ISNULL(m.IsDeleted, 0) = 0
        ORDER BY m.SentAt ASC;
      `);

    await pool.request()
      .input('ConvID', sql.Int, convId)
      .input('UserID', sql.Int, userId)
      .query(`
        UPDATE dbo.ConversationParticipants
        SET LastReadAt = SYSUTCDATETIME()
        WHERE ConvID = @ConvID AND UserID = @UserID
          AND COL_LENGTH('dbo.ConversationParticipants', 'LastReadAt') IS NOT NULL;
      `)
      .catch(() => {});

    res.json({ messages: result.recordset });
  } catch (err) {
    console.error('[Messages:getMessages]', err);
    res.status(500).json({ message: err.message || 'Could not load messages.' });
  }
}

async function sendMessage(req, res) {
  const userId = requireUser(req, res);
  if (!userId) return;

  const convId = Number(req.body.convId);
  const messageText = String(req.body.messageText || '').trim();
  const mediaUrl = req.body.mediaUrl || null;
  const messageType = req.body.messageType || 'text';

  if (!convId || (!messageText && !mediaUrl)) {
    return res.status(400).json({ message: 'Conversation and message text/media are required.' });
  }

  try {
    const pool = await poolPromise;

    const permission = await assertCanUseConversation(pool, convId, userId);

    if (!permission.ok) {
      return res.status(permission.status).json({ message: permission.message });
    }

    const result = await pool.request()
      .input('ConvID', sql.Int, convId)
      .input('SenderID', sql.Int, userId)
      .input('MessageText', sql.NVarChar(sql.MAX), messageText || null)
      .input('MediaURL', sql.NVarChar(500), mediaUrl)
      .input('MessageType', sql.NVarChar(20), messageType)
      .query(`
        INSERT INTO dbo.Messages (ConvID, SenderID, MessageText, MediaURL, MessageType)
        OUTPUT inserted.MessageID, inserted.ConvID, inserted.SenderID,
               inserted.MessageText, inserted.MediaURL, inserted.MessageType, inserted.SentAt
        VALUES (@ConvID, @SenderID, @MessageText, @MediaURL, @MessageType);
      `);

    const userResult = await pool.request()
      .input('UserID', sql.Int, userId)
      .query('SELECT DisplayName, Avatar FROM dbo.Users WHERE UserID = @UserID;');

    const sender = userResult.recordset[0] || {};

    const message = {
      ...result.recordset[0],
      SenderName: sender.DisplayName || 'You',
      SenderAvatar: sender.Avatar || '🧳',
      IsMine: true,
    };

    const io = req.app.get('io');

    if (io) {
      io.to(`conversation:${convId}`).emit('new_message', message);
      io.to(String(convId)).emit('new_message', message);
    }

    res.status(201).json({ message });
  } catch (err) {
    console.error('[Messages:sendMessage]', err);
    res.status(500).json({ message: err.message || 'Could not send message.' });
  }
}

async function markConversationRead(req, res) {
  const userId = requireUser(req, res);
  if (!userId) return;

  const convId = Number(req.params.convId);

  try {
    const pool = await poolPromise;

    const permission = await assertCanUseConversation(pool, convId, userId);

    if (!permission.ok) {
      return res.status(permission.status).json({ message: permission.message });
    }

    await pool.request()
      .input('ConvID', sql.Int, convId)
      .input('UserID', sql.Int, userId)
      .query(`
        UPDATE dbo.ConversationParticipants
        SET LastReadAt = SYSUTCDATETIME()
        WHERE ConvID = @ConvID AND UserID = @UserID;
      `);
  } catch (err) {
    console.warn('[Messages:markConversationRead]', err.message);
  }

  res.json({ success: true });
}

module.exports = {
  getUsers,
  getConversations,
  getMessages,
  sendMessage,
  markConversationRead,
  createConversation,
  createDirectConversation,
};
