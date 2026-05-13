const { sql, poolPromise } = require('../db');
const redis = require('../redis');

/**
 * Generate compatibility scores for potential buddies.
 * @param {number} currentUserId
 * @param {object} prefs - { destination, startDate, endDate, budgetMin, budgetMax,
 *                           travelStyleId, ageMin, ageMax, genderPref, groupSize, userAge }
 * @returns {Array} top 20 scored candidates
 */
async function findMatches(currentUserId, prefs) {
  // --- Redis cache check ---
  const cacheKey = `match:${currentUserId}:${prefs.destination}:${prefs.startDate}`;
  try {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch (e) {
    // Cache miss or error — continue without cache
  }

  const pool = await poolPromise;

  // --- Step 1: Pull excluded user IDs (already-requested or recently-declined) ---
  const excluded = await pool.request()
    .input('uid', sql.Int, currentUserId)
    .query(`
      SELECT ReceiverID AS ExcludedID FROM BuddyRequests
      WHERE SenderID = @uid
        AND Status IN ('pending', 'accepted')
        AND SentAt > DATEADD(DAY, -30, GETDATE())
      UNION
      SELECT SenderID FROM BuddyRequests
      WHERE ReceiverID = @uid
        AND Status = 'declined'
        AND SentAt > DATEADD(DAY, -30, GETDATE())
    `);
  const excludedIds = excluded.recordset.map(r => r.ExcludedID);
  const exclusionList = [currentUserId, ...excludedIds];

  // --- Step 2: Pull candidate profiles within budget tolerance (±30%) ---
  const budgetMin = Number(prefs.budgetMin) || 0;
  const budgetMax = Number(prefs.budgetMax) || 999999;

  let query = `
    SELECT
      tp.UserID, tp.BudgetMin, tp.BudgetMax, tp.TravelStyleID,
      tp.AgeRangeMin, tp.AgeRangeMax, tp.GenderPref,
      tp.TrustScore, tp.TripsCompleted, tp.BioText,
      u.DisplayName, u.AvatarURL
    FROM TravellerProfiles tp
    JOIN Users u ON u.UserID = tp.UserID
    WHERE tp.BudgetMin <= @budgetMaxTolerance
      AND tp.BudgetMax >= @budgetMinTolerance
  `;

  // Dynamic exclusion — parameterised doesn't support IN with dynamic list,
  // so we filter post-query for safety
  const candidates = await pool.request()
    .input('budgetMinTolerance', sql.Decimal(10, 2), budgetMin * 0.7)
    .input('budgetMaxTolerance', sql.Decimal(10, 2), budgetMax * 1.3)
    .query(query);

  // Filter out excluded IDs in JS for safety
  const filteredCandidates = candidates.recordset.filter(
    c => !exclusionList.includes(c.UserID)
  );

  // --- Step 3: Score each candidate (5 dimensions × 20 pts = 100 max) ---
  const travelStyleId = Number(prefs.travelStyleId) || 0;
  const userAge = Number(prefs.userAge) || 25;

  const scored = filteredCandidates.map(c => {
    let score = 0;

    // Dimension 1 — Travel style (20 pts)
    if (c.TravelStyleID === travelStyleId) {
      score += 20;
    } else if (travelStyleId && Math.abs(c.TravelStyleID - travelStyleId) === 1) {
      score += 12;
    }

    // Dimension 2 — Budget compatibility (20 pts)
    const budgetOverlap = Math.min(c.BudgetMax, budgetMax) - Math.max(c.BudgetMin, budgetMin);
    const prefRange = budgetMax - budgetMin || 1;
    const overlapRatio = budgetOverlap / prefRange;
    if (overlapRatio >= 0.9)      score += 20;
    else if (overlapRatio >= 0.7) score += 12;
    else if (overlapRatio >= 0.5) score += 6;

    // Dimension 3 — Age preference (20 pts)
    const inRange = userAge >= c.AgeRangeMin && userAge <= c.AgeRangeMax;
    if (inRange) {
      score += 20;
    } else if (
      Math.abs(userAge - (c.AgeRangeMin || 18)) <= 5 ||
      Math.abs(userAge - (c.AgeRangeMax || 80)) <= 5
    ) {
      score += 10;
    }

    // Dimension 4 — Trust score normalised to 20 pts (TrustScore is 0–5)
    score += ((c.TrustScore || 0) / 5) * 20;

    // Dimension 5 — Trips completed: normalise to 20 pts
    const tripScore = Math.min(c.TripsCompleted || 0, 10) / 10 * 20;
    score += tripScore;

    return {
      ...c,
      compatibilityScore: Math.round(score),
    };
  });

  // --- Step 4: Sort & return top 20 ---
  const top20 = scored
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
    .slice(0, 20);

  // --- Cache for 15 minutes ---
  try {
    await redis.set(cacheKey, JSON.stringify(top20), 'EX', 900);
  } catch (e) {
    // Cache write error — non-critical
  }

  return top20;
}

/**
 * Recalculate trust score for a user based on their buddy reviews.
 * Should be called after a new buddy review is saved — NOT on every read.
 * @param {number} userId
 */
async function recalculateTrustScore(userId) {
  const pool = await poolPromise;
  await pool.request()
    .input('uid', sql.Int, userId)
    .query(`
      UPDATE TravellerProfiles
      SET TrustScore = ISNULL((
        SELECT AVG(CAST(Rating AS DECIMAL(3,2)))
        FROM Reviews
        WHERE EntityType = 'buddy' AND EntityID = @uid
      ), 0.00)
      WHERE UserID = @uid
    `);
}

module.exports = { findMatches, recalculateTrustScore };
