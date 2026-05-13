const cron = require('node-cron');
const { poolPromise, sql } = require('../db');
const redis = require('../redis');

// Runs every day at 2:00 AM
cron.schedule('0 2 * * *', async () => {
  console.log('[RankingJob] Starting nightly TrustScore recalculation...');

  try {
    const pool = await poolPromise;

    // Step 1: Recalculate weighted TrustScore for each city
    // Weighting rules:
    //   Verified trip review (TripID IS NOT NULL AND Trip.Status='completed'): weight = 1.5
    //   Unverified review (no linked trip):                                   weight = 0.8
    //   Creator review (Users.Role = 'creator'):                               weight = 1.2
    //   New user review (user has fewer than 3 reviews total):                 weight = 0.6
    //   Otherwise:                                                             weight = 0.8

    await pool.request().query(`
      WITH WeightedReviews AS (
        SELECT
          a.CityID,
          r.Rating,
          CASE
            WHEN r.TripID IS NOT NULL AND t.Status = 'completed' THEN 1.5
            WHEN u.Role = 'creator'                               THEN 1.2
            WHEN (
              SELECT COUNT(*) FROM Reviews r2
              WHERE r2.ReviewerID = r.ReviewerID
            ) < 3                                                 THEN 0.6
            ELSE 0.8
          END AS Weight
        FROM Reviews r
        JOIN Users u        ON r.ReviewerID = u.UserID
        LEFT JOIN Trips t   ON r.TripID = t.TripID
        JOIN Attractions a  ON r.EntityID = a.AttractionID
                            AND r.EntityType = 'attraction'
        
        UNION ALL

        SELECT
          h.CityID,
          r.Rating,
          CASE
            WHEN r.TripID IS NOT NULL AND t.Status = 'completed' THEN 1.5
            WHEN u.Role = 'creator'                               THEN 1.2
            WHEN (
              SELECT COUNT(*) FROM Reviews r2
              WHERE r2.ReviewerID = r.ReviewerID
            ) < 3                                                 THEN 0.6
            ELSE 0.8
          END AS Weight
        FROM Reviews r
        JOIN Users u      ON r.ReviewerID = u.UserID
        LEFT JOIN Trips t ON r.TripID = t.TripID
        JOIN Hotels h     ON r.EntityID = h.HotelID
                          AND r.EntityType = 'hotel'

        UNION ALL

        SELECT
          rs.CityID,
          r.Rating,
          CASE
            WHEN r.TripID IS NOT NULL AND t.Status = 'completed' THEN 1.5
            WHEN u.Role = 'creator'                               THEN 1.2
            WHEN (
              SELECT COUNT(*) FROM Reviews r2
              WHERE r2.ReviewerID = r.ReviewerID
            ) < 3                                                 THEN 0.6
            ELSE 0.8
          END AS Weight
        FROM Reviews r
        JOIN Users u        ON r.ReviewerID = u.UserID
        LEFT JOIN Trips t   ON r.TripID = t.TripID
        JOIN Restaurants rs ON r.EntityID = rs.RestaurantID
                            AND r.EntityType = 'restaurant'
      )
      UPDATE Cities
      SET
        TrustScore  = (
          SELECT ROUND(SUM(wr.Rating * wr.Weight) / NULLIF(SUM(wr.Weight), 0), 2)
          FROM WeightedReviews wr
          WHERE wr.CityID = Cities.CityID
        ),
        ReviewCount = (
          SELECT COUNT(*)
          FROM WeightedReviews wr
          WHERE wr.CityID = Cities.CityID
        )
      WHERE EXISTS (
        SELECT 1 FROM WeightedReviews wr WHERE wr.CityID = Cities.CityID
      );
    `);

    console.log('[RankingJob] TrustScore recalculation complete.');

    // Step 2: Invalidate the Redis cache so next Explore page load gets fresh data
    const cacheKeys = await redis.keys('explore:*');
    if (cacheKeys.length > 0) {
      await redis.del(...cacheKeys);
      console.log(`[RankingJob] Redis cache invalidated: ${cacheKeys.length} keys deleted.`);
    }

  } catch (err) {
    console.error('[RankingJob] Error during ranking job:', err);
  }
});

console.log('[RankingJob] Nightly ranking job scheduled.');
