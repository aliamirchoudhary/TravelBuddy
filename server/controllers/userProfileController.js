const { sql, poolPromise } = require('../db');
const redis = require('../redis');

/**
 * GET /api/users/:userId/profile
 * Returns full profile data for the profile page.
 */
async function getProfile(req, res) {
  try {
    let { userId } = req.params;
    const requesterId = req.user?.id || null;
    
    if (userId === 'me') {
      if (!requesterId) return res.status(401).json({ error: 'Login required for "me" profile' });
      userId = requesterId;
    }

    const isOwner = requesterId && parseInt(requesterId) === parseInt(userId);
    const pool = await poolPromise;

    // 1. Basic user info
    const userResult = await pool.request()
      .input('uid', sql.Int, userId)
      .query(`
        SELECT UserID, Email, DisplayName, Avatar, AvatarURL, CoverPhotoURL, HomeCity,
               Bio, Role, CreatedAt, LastActiveAt
        FROM Users WHERE UserID = @uid
      `);

    if (!userResult.recordset[0]) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.recordset[0];

    // Include Email only for the profile owner
    if (!isOwner) {
      delete user.Email;
    }

    // Cover photo fallback: user upload → latest trip thumbnail → null
    if (!user.CoverPhotoURL) {
      const latestTrip = await pool.request()
        .input('uid', sql.Int, userId)
        .query(`
          SELECT TOP 1 ci.ThumbnailURL
          FROM Trips t
          JOIN Cities ci ON t.DestinationCityID = ci.CityID
          WHERE t.UserID = @uid AND t.Status = 'completed'
          ORDER BY t.EndDate DESC
        `);
      if (latestTrip.recordset[0]?.ThumbnailURL) {
        user.CoverPhotoURL = latestTrip.recordset[0].ThumbnailURL;
      }
    }

    // 2. Privacy settings
    const privacyResult = await pool.request()
      .input('uid', sql.Int, userId)
      .query(`
        SELECT ShowTimeline, ShowExpenseHistory, ShowReviews
        FROM UserPrivacySettings WHERE UserID = @uid
      `);
    const privacySettings = privacyResult.recordset[0] || {
      ShowTimeline: true,
      ShowExpenseHistory: false,
      ShowReviews: true,
    };

    // 3. Stats
    const tripsCount = await pool.request()
      .input('uid', sql.Int, userId)
      .query(`SELECT COUNT(*) as count FROM Trips WHERE UserID=@uid AND Status='completed'`);

    // Countries visited — Redis cached
    let countriesVisited = 0;
    const cacheKey = `user:${userId}:countries_visited`;
    try {
      const cached = await redis.get(cacheKey);
      if (cached !== null) {
        countriesVisited = parseInt(cached);
      } else {
        const countryResult = await pool.request()
          .input('uid', sql.Int, userId)
          .query(`
            SELECT COUNT(DISTINCT co.CountryID) as count
            FROM Trips t
            JOIN Cities ci ON t.DestinationCityID = ci.CityID
            JOIN Countries co ON ci.CountryID = co.CountryID
            WHERE t.UserID = @uid AND t.Status = 'completed'
          `);
        countriesVisited = countryResult.recordset[0].count;
        await redis.set(cacheKey, countriesVisited.toString(), 'EX', 3600);
      }
    } catch (cacheErr) {
      // If Redis fails, just compute directly
      const countryResult = await pool.request()
        .input('uid', sql.Int, userId)
        .query(`
          SELECT COUNT(DISTINCT co.CountryID) as count
          FROM Trips t
          JOIN Cities ci ON t.DestinationCityID = ci.CityID
          JOIN Countries co ON ci.CountryID = co.CountryID
          WHERE t.UserID = @uid AND t.Status = 'completed'
        `);
      countriesVisited = countryResult.recordset[0].count;
    }

    const reviewsCount = await pool.request()
      .input('uid', sql.Int, userId)
      .query(`SELECT COUNT(*) as count FROM Reviews WHERE ReviewerID = @uid`);

    const buddiesCount = await pool.request()
      .input('uid', sql.Int, userId)
      .query(`
        SELECT COUNT(*) as count FROM BuddyConnections
        WHERE User1ID = @uid OR User2ID = @uid
      `);

    // 4. Badges
    const badges = await pool.request()
      .input('uid', sql.Int, userId)
      .query(`
        SELECT b.BadgeID, b.Name, b.Description, b.IconURL, ub.EarnedAt
        FROM UserBadges ub
        JOIN Badges b ON ub.BadgeID = b.BadgeID
        WHERE ub.UserID = @uid
        ORDER BY ub.EarnedAt DESC
      `);

    // 5. Travel Timeline (respect privacy: owner always sees their own)
    let timeline = [];
    if (isOwner || privacySettings.ShowTimeline) {
      const timelineResult = await pool.request()
        .input('uid', sql.Int, userId)
        .query(`
          SELECT t.TripID, t.TripName, t.StartDate, t.EndDate, t.Status,
                 ci.Name as CityName, ci.ThumbnailURL, co.Name as CountryName,
                 co.FlagEmoji, ts.StyleName as TravelStyle
          FROM Trips t
          LEFT JOIN Cities ci ON t.DestinationCityID = ci.CityID
          LEFT JOIN Countries co ON ci.CountryID = co.CountryID
          LEFT JOIN TravelStyles ts ON t.TravelStyleID = ts.StyleID
          WHERE t.UserID = @uid
          ORDER BY t.StartDate DESC
        `);
      timeline = timelineResult.recordset;
    }

    // 6. Buddy request status (for "Send Buddy Request" button on other profiles)
    let buddyStatus = null;
    if (requesterId && !isOwner) {
      const buddyReq = await pool.request()
        .input('sender', sql.Int, requesterId)
        .input('receiver', sql.Int, userId)
        .query(`
          SELECT TOP 1 Status FROM BuddyRequests
          WHERE (SenderID = @sender AND ReceiverID = @receiver)
             OR (SenderID = @receiver AND ReceiverID = @sender)
          ORDER BY SentAt DESC
        `);
      if (buddyReq.recordset[0]) {
        buddyStatus = buddyReq.recordset[0].Status;
      }

      // Also check if already connected
      const connection = await pool.request()
        .input('u1', sql.Int, requesterId)
        .input('u2', sql.Int, userId)
        .query(`
          SELECT TOP 1 ConnectionID FROM BuddyConnections
          WHERE (User1ID = @u1 AND User2ID = @u2) OR (User1ID = @u2 AND User2ID = @u1)
        `);
      if (connection.recordset[0]) {
        buddyStatus = 'connected';
      }
    }

    res.json({
      user,
      stats: {
        tripsCompleted: tripsCount.recordset[0].count,
        countriesVisited,
        reviewsWritten: reviewsCount.recordset[0].count,
        buddiesMade: buddiesCount.recordset[0].count,
      },
      badges: badges.recordset,
      timeline,
      privacySettings: isOwner ? privacySettings : {
        ShowTimeline: privacySettings.ShowTimeline,
        ShowReviews: privacySettings.ShowReviews,
      },
      buddyStatus,
      isOwner,
    });
  } catch (err) {
    console.error('getProfile error:', err);
    res.status(500).json({ error: 'Failed to load profile' });
  }
}

/**
 * GET /api/users/:userId/reviews
 * Returns paginated reviews written by this user.
 */
async function getUserReviews(req, res) {
  try {
    let { userId } = req.params;
    const requesterId = req.user?.id || null;

    if (userId === 'me') {
      if (!requesterId) return res.status(401).json({ error: 'Login required' });
      userId = requesterId;
    }

    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const offset = (page - 1) * limit;
    const pool = await poolPromise;

    // Check privacy
    const isOwner = requesterId && parseInt(requesterId) === parseInt(userId);

    if (!isOwner) {
      const privacy = await pool.request()
        .input('uid', sql.Int, userId)
        .query(`SELECT ShowReviews FROM UserPrivacySettings WHERE UserID = @uid`);
      const settings = privacy.recordset[0];
      if (settings && !settings.ShowReviews) {
        return res.json({ reviews: [], total: 0, message: 'Reviews are private' });
      }
    }

    const countResult = await pool.request()
      .input('uid', sql.Int, userId)
      .query(`SELECT COUNT(*) as total FROM Reviews WHERE ReviewerID = @uid`);

    const result = await pool.request()
      .input('uid', sql.Int, userId)
      .input('offset', sql.Int, offset)
      .input('limit', sql.Int, limit)
      .query(`
        SELECT r.ReviewID, r.EntityType, r.EntityID, r.Rating, r.Title,
               r.ReviewText, r.IsVerified, r.HelpfulCount, r.CreatedAt
        FROM Reviews r
        WHERE r.ReviewerID = @uid
        ORDER BY r.CreatedAt DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
      `);

    res.json({
      reviews: result.recordset,
      total: countResult.recordset[0].total,
      page,
      limit,
    });
  } catch (err) {
    console.error('getUserReviews error:', err);
    res.status(500).json({ error: 'Failed to load reviews' });
  }
}

/**
 * PUT /api/users/me/profile
 * Update own profile (display name, home city, avatar URL, cover photo URL).
 */
async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { displayName, homeCity, bio, avatarURL, coverPhotoURL } = req.body;
    const pool = await poolPromise;

    // Build dynamic SET clauses
    const updates = [];
    const request = pool.request().input('uid', sql.Int, userId);

    if (displayName !== undefined) {
      request.input('name', sql.NVarChar, displayName);
      updates.push('DisplayName=@name');
    }
    if (homeCity !== undefined) {
      request.input('city', sql.NVarChar, homeCity);
      updates.push('HomeCity=@city');
    }
    if (bio !== undefined) {
      request.input('bio', sql.NVarChar, bio);
      updates.push('Bio=@bio');
    }
    if (avatarURL !== undefined) {
      request.input('avatarUrl', sql.NVarChar, avatarURL);
      updates.push('AvatarURL=@avatarUrl');
    }
    if (coverPhotoURL !== undefined) {
      request.input('coverUrl', sql.NVarChar, coverPhotoURL);
      updates.push('CoverPhotoURL=@coverUrl');
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    await request.query(`UPDATE Users SET ${updates.join(', ')} WHERE UserID=@uid`);

    // Return updated user — use safe column list
    const updated = await pool.request()
      .input('uid', sql.Int, userId)
      .query(`
        SELECT UserID as id, Email as email, DisplayName as displayName,
               Avatar as avatar, AvatarURL as avatarURL, CoverPhotoURL as coverPhotoURL,
               HomeCity as homeCity, Bio as bio, Role as role
        FROM Users WHERE UserID=@uid
      `);

    const user = updated.recordset[0] || null;
    res.json({ success: true, user });
  } catch (err) {
    console.error('updateProfile error:', err.message || err);
    res.status(500).json({ error: 'Failed to update profile: ' + (err.message || 'unknown error') });
  }
}

/**
 * PUT /api/users/me/privacy
 * Update privacy settings (upsert).
 */
async function updatePrivacy(req, res) {
  try {
    const userId = req.user.id;
    const { showTimeline, showExpenseHistory, showReviews } = req.body;
    const pool = await poolPromise;

    await pool.request()
      .input('uid', sql.Int, userId)
      .input('tl', sql.Bit, showTimeline ? 1 : 0)
      .input('ex', sql.Bit, showExpenseHistory ? 1 : 0)
      .input('rv', sql.Bit, showReviews ? 1 : 0)
      .query(`
        MERGE UserPrivacySettings AS target
        USING (SELECT @uid AS UserID) AS source ON target.UserID = source.UserID
        WHEN MATCHED THEN
          UPDATE SET ShowTimeline=@tl, ShowExpenseHistory=@ex, ShowReviews=@rv, UpdatedAt=GETDATE()
        WHEN NOT MATCHED THEN
          INSERT (UserID, ShowTimeline, ShowExpenseHistory, ShowReviews)
          VALUES (@uid, @tl, @ex, @rv);
      `);

    res.json({
      success: true,
      settings: {
        ShowTimeline: !!showTimeline,
        ShowExpenseHistory: !!showExpenseHistory,
        ShowReviews: !!showReviews,
      },
    });
  } catch (err) {
    console.error('updatePrivacy error:', err);
    res.status(500).json({ error: 'Failed to update privacy settings' });
  }
}

/**
 * GET /api/users/:userId/groups
 * Returns groups the user has joined.
 */
async function getUserGroups(req, res) {
  try {
    let { userId } = req.params;
    if (userId === 'me') {
      if (!req.user?.id) return res.status(401).json({ error: 'Login required' });
      userId = req.user.id;
    }
    const pool = await poolPromise;

    const result = await pool.request()
      .input('uid', sql.Int, userId)
      .query(`
        SELECT g.GroupID, g.Name, g.Description, g.CoverImageURL, g.MemberCount, g.IsOfficial
        FROM Groups g
        JOIN GroupMembers gm ON g.GroupID = gm.GroupID
        WHERE gm.UserID = @uid
        ORDER BY g.Name ASC
      `);

    res.json({ groups: result.recordset });
  } catch (err) {
    console.error('getUserGroups error:', err);
    res.json({ groups: [] });
  }
}

/**
 * PUT /api/users/me/avatar
 * Upload avatar via Cloudinary (multipart).
 */
async function updateAvatar(req, res) {
  try {
    console.log('updateAvatar - req.file:', req.file);
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const pool = await poolPromise;
    const avatarURL = req.file.path || req.file.secure_url || req.file.url;

    await pool.request()
      .input('uid', sql.Int, req.user.id)
      .input('url', sql.NVarChar, avatarURL)
      .query(`UPDATE Users SET AvatarURL = @url WHERE UserID = @uid`);

    res.json({ avatarURL });
  } catch (err) {
    console.error('updateAvatar error:', err);
    res.status(500).json({ error: 'Failed to update avatar' });
  }
}

/**
 * PUT /api/users/me/cover
 * Upload cover photo via Cloudinary (multipart).
 */
async function updateCover(req, res) {
  try {
    console.log('updateCover - req.file:', req.file);
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const pool = await poolPromise;
    const coverURL = req.file.path || req.file.secure_url || req.file.url;

    await pool.request()
      .input('uid', sql.Int, req.user.id)
      .input('url', sql.NVarChar, coverURL)
      .query(`UPDATE Users SET CoverPhotoURL = @url WHERE UserID = @uid`);

    res.json({ coverPhotoURL: coverURL });
  } catch (err) {
    console.error('updateCover error:', err);
    res.status(500).json({ error: 'Failed to update cover photo' });
  }
}

module.exports = {
  getProfile,
  getUserReviews,
  updateProfile,
  updatePrivacy,
  getUserGroups,
  updateAvatar,
  updateCover,
};
