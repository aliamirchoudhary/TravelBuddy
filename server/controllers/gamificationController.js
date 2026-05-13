const { poolPromise } = require('../db');
const redis = require('../redis');

/**
 * GET /api/gamification/leaderboard
 * Returns top 5 users by badge count
 */
const getLeaderboard = async (req, res) => {
  try {
    // 1. Check Cache
    const cacheKey = 'leaderboard:badges';
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    // 2. Fetch from DB
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT TOP 5
        u.UserID, u.DisplayName, u.AvatarURL,
        COUNT(ub.BadgeID) as BadgeCount
      FROM Users u
      LEFT JOIN UserBadges ub ON u.UserID = ub.UserID
      GROUP BY u.UserID, u.DisplayName, u.AvatarURL
      ORDER BY BadgeCount DESC
    `);

    const leaderboard = result.recordset;

    // 3. Cache for 1 hour
    await redis.set(cacheKey, JSON.stringify(leaderboard), 'EX', 3600);

    res.json(leaderboard);
  } catch (err) {
    console.error('getLeaderboard error:', err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};

/**
 * GET /api/gamification/users/:userId/badges
 * Return all badges earned by a user
 */
const getUserBadges = async (req, res) => {
  try {
    const { userId } = req.params;
    const pool = await poolPromise;
    const result = await pool.request()
      .input('uid', require('../db').sql.Int, userId)
      .query(`
        SELECT b.BadgeID, b.Name, b.Description, b.IconURL, ub.EarnedAt
        FROM UserBadges ub
        JOIN Badges b ON ub.BadgeID = b.BadgeID
        WHERE ub.UserID = @uid
        ORDER BY ub.EarnedAt DESC
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error('getUserBadges error:', err);
    res.status(500).json({ error: 'Failed to fetch user badges' });
  }
};

module.exports = {
  getLeaderboard,
  getUserBadges
};
