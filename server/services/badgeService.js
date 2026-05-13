const { sql, poolPromise } = require('../db');

// All badge rules in one place
const BADGE_RULES = {
  trip_count: [
    { threshold: 1,  badgeId: 1 },  // First Steps
    { threshold: 5,  badgeId: 2 },  // Explorer
    { threshold: 10, badgeId: 3 },  // World Traveller
  ],
  country_count: [
    { threshold: 5,  badgeId: 4 },  // Globe Trotter
    { threshold: 15, badgeId: 5 },  // World Explorer
  ],
  trust_score: [
    { threshold: 4.5, badgeId: 6 }, // Trusted Traveller
  ],
  buddy_count: [
    { threshold: 5,  badgeId: 7 },  // Social Butterfly
  ],
  review_count: [
    { threshold: 10, badgeId: 8 },  // Critic
  ],
  expense_total: [
    { threshold: 50000, badgeId: 9 }, // Budget Master
  ],
  post_views: [
    { threshold: 1000, badgeId: 10 }, // Content King
  ],
  adventure_trips: [
    { threshold: 3, badgeId: 11 },  // Adventurer
  ],
  group_members: [
    { threshold: 50, badgeId: 12 }, // Group Leader
  ],
};

/**
 * Check if user qualifies for any badge and award it.
 * @param {number} userId
 * @param {string} triggerKey  - one of the keys in BADGE_RULES
 * @param {number} currentValue - the current count/score to evaluate
 * @param {object} io - Socket.io instance (optional, for real-time notification)
 */
const checkAndAward = async (userId, triggerKey, currentValue, io = null) => {
  const rules = BADGE_RULES[triggerKey];
  if (!rules) return;

  const pool = await poolPromise;

  for (const rule of rules) {
    if (currentValue >= rule.threshold) {
      // Check if already awarded (NEVER award twice)
      const existing = await pool.request()
        .input('uid', sql.Int, userId)
        .input('bid', sql.Int, rule.badgeId)
        .query(`
          SELECT COUNT(*) as cnt FROM UserBadges
          WHERE UserID = @uid AND BadgeID = @bid
        `);

      if (existing.recordset[0].cnt === 0) {
        // Award the badge
        await pool.request()
          .input('uid', sql.Int, userId)
          .input('bid', sql.Int, rule.badgeId)
          .query(`
            INSERT INTO UserBadges (UserID, BadgeID, EarnedAt)
            VALUES (@uid, @bid, GETDATE())
          `);

        // Fetch badge details for notification
        const badgeDetails = await pool.request()
          .input('bid', sql.Int, rule.badgeId)
          .query(`SELECT * FROM Badges WHERE BadgeID = @bid`);

        const badge = badgeDetails.recordset[0];
        console.log(`[BadgeService] Awarded "${badge.Name}" to user ${userId}`);

        // Emit real-time notification via Socket.io
        if (io) {
          io.to(`user:${userId}`).emit('badge_earned', {
            badge: {
              id: badge.BadgeID,
              name: badge.Name,
              description: badge.Description,
              iconURL: badge.IconURL,
            },
            earnedAt: new Date().toISOString()
          });
        }
      }
    }
  }
};

/**
 * Helper: get current trip count for user
 */
const getTripCount = async (userId) => {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('uid', sql.Int, userId)
    .query(`SELECT COUNT(*) as count FROM Trips WHERE UserID=@uid AND Status='completed'`);
  return result.recordset[0].count;
};

/**
 * Helper: get countries visited count
 */
const getCountriesVisited = async (userId) => {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('uid', sql.Int, userId)
    .query(`
      SELECT COUNT(DISTINCT co.CountryID) as count
      FROM Trips t
      JOIN Cities ci ON t.DestinationCityID = ci.CityID
      JOIN Countries co ON ci.CountryID = co.CountryID
      WHERE t.UserID = @uid AND t.Status = 'completed'
    `);
  return result.recordset[0].count;
};

/**
 * Helper: get buddy connection count
 */
const getBuddyCount = async (userId) => {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('uid', sql.Int, userId)
    .query(`
      SELECT COUNT(*) as count FROM BuddyConnections
      WHERE (User1ID = @uid OR User2ID = @uid)
    `);
  return result.recordset[0].count;
};

/**
 * Helper: get review count
 */
const getReviewCount = async (userId) => {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('uid', sql.Int, userId)
    .query(`SELECT COUNT(*) as count FROM Reviews WHERE ReviewerID = @uid`);
  return result.recordset[0].count;
};

/**
 * Helper: get trust score
 */
const getTrustScore = async (userId) => {
  const pool = await poolPromise;
  try {
    const prof = await pool.request().input('uid', sql.Int, userId).query(`SELECT TrustScore FROM TravellerProfiles WHERE UserID = @uid`);
    return prof.recordset[0]?.TrustScore || 0;
  } catch (err) {
    return 0;
  }
};

/**
 * Helper: get total shared expenses in PKR
 */
const getExpenseTotal = async (userId) => {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('uid', sql.Int, userId)
    .query(`
      SELECT ISNULL(SUM(e.TotalAmount), 0) as total
      FROM Expenses e
      WHERE e.PaidByUserID = @uid AND e.Currency = 'PKR'
    `);
  return result.recordset[0].total;
};

/**
 * Helper: count how many completed trips contain an adventure attraction
 */
const getAdventureTripsCount = async (userId) => {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('uid', sql.Int, userId)
    .query(`
      SELECT COUNT(DISTINCT t.TripID) as count
      FROM Trips t
      JOIN ItineraryDays d ON t.TripID = d.TripID
      JOIN ItineraryItems ii ON d.DayID = ii.DayID
      LEFT JOIN Attractions a ON (ii.PlaceType = 'attraction' AND ii.PlaceID = a.AttractionID)
      WHERE t.UserID = @uid AND t.Status = 'completed'
      AND (a.Category = 'adventure' OR ii.Title LIKE '%Hike%' OR ii.Title LIKE '%Trek%' OR ii.Title LIKE '%Adventure%')
    `);
  return result.recordset[0].count;
};

module.exports = {
  checkAndAward,
  getTripCount,
  getCountriesVisited,
  getBuddyCount,
  getReviewCount,
  getTrustScore,
  getExpenseTotal,
  getAdventureTripsCount
};
