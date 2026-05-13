const { sql, poolPromise } = require('../db');
const { findMatches } = require('../services/matchingService');

/**
 * POST /api/buddy/match
 * Run the matching algorithm against the caller's preferences.
 */
async function matchBuddies(req, res) {
  try {
    const currentUserId = req.user.id;
    const prefs = req.body; // { destination, startDate, endDate, budgetMin, budgetMax, travelStyleId, ... }
    const results = await findMatches(currentUserId, prefs);
    res.json({ matches: results });
  } catch (err) {
    console.error('matchBuddies error:', err);
    res.status(500).json({ message: 'Matching failed' });
  }
}

/**
 * POST /api/buddy/request
 * Send a buddy request to another user.
 */
async function sendRequest(req, res) {
  try {
    const senderId = req.user.id;
    const { receiverId, tripId } = req.body;

    if (!receiverId) {
      return res.status(400).json({ message: 'receiverId is required' });
    }

    const pool = await poolPromise;

    // Prevent duplicate pending requests
    const exists = await pool.request()
      .input('sid', sql.Int, senderId)
      .input('rid', sql.Int, receiverId)
      .query(`
        SELECT COUNT(*) AS cnt FROM BuddyRequests
        WHERE SenderID = @sid AND ReceiverID = @rid AND Status = 'pending'
      `);

    if (exists.recordset[0].cnt > 0) {
      return res.status(409).json({ message: 'Request already pending' });
    }

    await pool.request()
      .input('sid', sql.Int, senderId)
      .input('rid', sql.Int, receiverId)
      .input('tid', sql.Int, tripId || null)
      .query(`
        INSERT INTO BuddyRequests (SenderID, ReceiverID, TripID)
        VALUES (@sid, @rid, @tid)
      `);

    // Emit real-time notification
    if (req.io) {
      req.io.to(`user:${receiverId}`).emit('buddy_request', {
        fromUserId: senderId,
        message: 'You have a new buddy request!',
      });
    }

    res.status(201).json({ message: 'Request sent' });
  } catch (err) {
    console.error('sendRequest error:', err);
    res.status(500).json({ message: 'Could not send request' });
  }
}

/**
 * PUT /api/buddy/request/:requestId
 * Accept or decline a buddy request.
 */
async function respondToRequest(req, res) {
  try {
    const receiverId = req.user.id;
    const { requestId } = req.params;
    const { action } = req.body; // 'accepted' | 'declined'

    if (!['accepted', 'declined'].includes(action)) {
      return res.status(400).json({ message: 'action must be "accepted" or "declined"' });
    }

    const pool = await poolPromise;

    // Verify the request exists and belongs to this receiver
    const reqRow = await pool.request()
      .input('reqId', sql.Int, requestId)
      .query('SELECT * FROM BuddyRequests WHERE RequestID = @reqId');

    const buddyReq = reqRow.recordset[0];
    if (!buddyReq) {
      return res.status(404).json({ message: 'Request not found' });
    }
    if (buddyReq.ReceiverID !== receiverId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Update status
    await pool.request()
      .input('status', sql.NVarChar, action)
      .input('reqId', sql.Int, requestId)
      .query(`
        UPDATE BuddyRequests
        SET Status = @status, RespondedAt = GETDATE()
        WHERE RequestID = @reqId
      `);

    if (action === 'accepted') {
      // Create the buddy connection
      await pool.request()
        .input('u1', sql.Int, buddyReq.SenderID)
        .input('u2', sql.Int, receiverId)
        .input('tid', sql.Int, buddyReq.TripID)
        .query(`
          INSERT INTO BuddyConnections (User1ID, User2ID, TripID)
          VALUES (@u1, @u2, @tid)
        `);

      // FEATURE 4: Auto-add as collaborator if a TripID was attached
      if (buddyReq.TripID) {
        await pool.request()
          .input('tid',  sql.Int,       buddyReq.TripID)
          .input('uid',  sql.Int,       receiverId)
          .input('role', sql.NVarChar,  'buddy')
          .query(`
            IF NOT EXISTS (SELECT 1 FROM TripCollaborators WHERE TripID=@tid AND UserID=@uid)
            INSERT INTO TripCollaborators (TripID,UserID,Role) VALUES (@tid,@uid,'buddy')
          `);
      }

      // Notify sender
      if (req.io) {
        req.io.to(`user:${buddyReq.SenderID}`).emit('buddy_accepted', {
          byUserId: receiverId,
          message: 'Your buddy request was accepted!',
        });
      }

      // Badge check for buddy connections
      const badgeService = require('../services/badgeService');
      const buddyCountReceiver = await badgeService.getBuddyCount(receiverId);
      const buddyCountSender = await badgeService.getBuddyCount(buddyReq.SenderID);
      badgeService.checkAndAward(receiverId, 'buddy_count', buddyCountReceiver, req.io).catch(console.error);
      badgeService.checkAndAward(buddyReq.SenderID, 'buddy_count', buddyCountSender, req.io).catch(console.error);

    } else {
      // Notify sender of decline
      if (req.io) {
        req.io.to(`user:${buddyReq.SenderID}`).emit('buddy_declined', {
          byUserId: receiverId,
        });
      }
    }

    res.json({ message: `Request ${action}` });
  } catch (err) {
    console.error('respondToRequest error:', err);
    res.status(500).json({ message: 'Could not respond to request' });
  }
}

/**
 * GET /api/buddy/requests
 * Fetch incoming pending requests for the current user.
 */
async function getIncomingRequests(req, res) {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('uid', sql.Int, req.user.id)
      .query(`
        SELECT br.*, u.DisplayName, u.AvatarURL
        FROM BuddyRequests br
        JOIN Users u ON u.UserID = br.SenderID
        WHERE br.ReceiverID = @uid AND br.Status = 'pending'
        ORDER BY br.SentAt DESC
      `);
    res.json({ requests: result.recordset });
  } catch (err) {
    console.error('getIncomingRequests error:', err);
    res.status(500).json({ message: 'Error fetching requests' });
  }
}

/**
 * GET /api/buddy/connections
 * Fetch current user's buddy connections.
 */
async function getConnections(req, res) {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('uid', sql.Int, req.user.id)
      .query(`
        SELECT bc.*, 
          u1.DisplayName AS User1Name, u1.AvatarURL AS User1Avatar,
          u2.DisplayName AS User2Name, u2.AvatarURL AS User2Avatar
        FROM BuddyConnections bc
        JOIN Users u1 ON u1.UserID = bc.User1ID
        JOIN Users u2 ON u2.UserID = bc.User2ID
        WHERE bc.User1ID = @uid OR bc.User2ID = @uid
        ORDER BY bc.ConnectedAt DESC
      `);
    res.json({ connections: result.recordset });
  } catch (err) {
    console.error('getConnections error:', err);
    res.status(500).json({ message: 'Error fetching connections' });
  }
}

/**
 * GET /api/buddy/profile
 * Get or create the current user's traveller profile.
 */
async function getProfile(req, res) {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('uid', sql.Int, req.user.id)
      .query(`
        SELECT tp.*, ts.StyleName
        FROM TravellerProfiles tp
        LEFT JOIN TravelStyles ts ON ts.StyleID = tp.TravelStyleID
        WHERE tp.UserID = @uid
      `);

    if (!result.recordset.length) {
      return res.json({ profile: null });
    }

    res.json({ profile: result.recordset[0] });
  } catch (err) {
    console.error('getProfile error:', err);
    res.status(500).json({ message: 'Error fetching profile' });
  }
}

/**
 * PUT /api/buddy/profile
 * Update the current user's traveller profile.
 */
async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const {
      budgetMin, budgetMax, travelStyleId,
      ageRangeMin, ageRangeMax, genderPref, bioText,
    } = req.body;

    const pool = await poolPromise;

    // Upsert — check if profile exists
    const existing = await pool.request()
      .input('uid', sql.Int, userId)
      .query('SELECT UserID FROM TravellerProfiles WHERE UserID = @uid');

    if (existing.recordset.length) {
      await pool.request()
        .input('uid', sql.Int, userId)
        .input('budgetMin', sql.Decimal(10, 2), budgetMin)
        .input('budgetMax', sql.Decimal(10, 2), budgetMax)
        .input('styleId', sql.Int, travelStyleId)
        .input('ageMin', sql.TinyInt, ageRangeMin)
        .input('ageMax', sql.TinyInt, ageRangeMax)
        .input('genderPref', sql.NVarChar, genderPref)
        .input('bio', sql.NVarChar, bioText)
        .query(`
          UPDATE TravellerProfiles
          SET BudgetMin = @budgetMin, BudgetMax = @budgetMax,
              TravelStyleID = @styleId,
              AgeRangeMin = @ageMin, AgeRangeMax = @ageMax,
              GenderPref = @genderPref, BioText = @bio
          WHERE UserID = @uid
        `);
    } else {
      await pool.request()
        .input('uid', sql.Int, userId)
        .input('budgetMin', sql.Decimal(10, 2), budgetMin)
        .input('budgetMax', sql.Decimal(10, 2), budgetMax)
        .input('styleId', sql.Int, travelStyleId)
        .input('ageMin', sql.TinyInt, ageRangeMin)
        .input('ageMax', sql.TinyInt, ageRangeMax)
        .input('genderPref', sql.NVarChar, genderPref)
        .input('bio', sql.NVarChar, bioText)
        .query(`
          INSERT INTO TravellerProfiles 
            (UserID, BudgetMin, BudgetMax, TravelStyleID, AgeRangeMin, AgeRangeMax, GenderPref, BioText)
          VALUES 
            (@uid, @budgetMin, @budgetMax, @styleId, @ageMin, @ageMax, @genderPref, @bio)
        `);
    }

    res.json({ message: 'Profile updated' });
  } catch (err) {
    console.error('updateProfile error:', err);
    res.status(500).json({ message: 'Error updating profile' });
  }
}

module.exports = {
  matchBuddies,
  sendRequest,
  respondToRequest,
  getIncomingRequests,
  getConnections,
  getProfile,
  updateProfile,
};
