const { sql, poolPromise } = require('../db');

function normaliseEntityType(type) {
  const value = String(type || '').toLowerCase();
  const allowed = ['hotel', 'restaurant', 'attraction', 'buddy', 'city'];
  return allowed.includes(value) ? value : null;
}

function targetTableFor(type) {
  if (type === 'hotel') return { table: 'Hotels', id: 'HotelID' };
  if (type === 'restaurant') return { table: 'Restaurants', id: 'RestaurantID' };
  if (type === 'attraction') return { table: 'Attractions', id: 'AttractionID' };
  if (type === 'buddy') return { table: 'TravellerProfiles', id: 'UserID' };
  return null; // city reviews are shown only, no TrustScore column in Cities currently
}

async function computeWeightedAverage(pool, entityType, entityId) {
  const result = await pool.request()
    .input('entityType', sql.NVarChar(30), entityType)
    .input('entityId', sql.Int, entityId)
    .query(`
      SELECT
        CAST(
          COALESCE(
            SUM(CAST(r.Rating AS DECIMAL(10,2)) *
              CASE
                WHEN r.IsVerified = 1 THEN 1.5
                WHEN u.Role = 'creator' THEN 1.2
                WHEN reviewerStats.TotalReviews < 3 THEN 0.6
                ELSE 0.8
              END
            ) / NULLIF(SUM(
              CASE
                WHEN r.IsVerified = 1 THEN 1.5
                WHEN u.Role = 'creator' THEN 1.2
                WHEN reviewerStats.TotalReviews < 3 THEN 0.6
                ELSE 0.8
              END
            ), 0),
          0) AS DECIMAL(3,2)
        ) AS WeightedRating,
        COUNT(*) AS ReviewCount
      FROM Reviews r
      JOIN Users u ON u.UserID = r.ReviewerID
      CROSS APPLY (
        SELECT COUNT(*) AS TotalReviews
        FROM Reviews r2
        WHERE r2.ReviewerID = r.ReviewerID
      ) reviewerStats
      WHERE r.EntityType = @entityType AND r.EntityID = @entityId;
    `);

  return result.recordset[0] || { WeightedRating: 0, ReviewCount: 0 };
}

async function updateTrustScore(pool, entityType, entityId) {
  const target = targetTableFor(entityType);
  if (!target) return;

  const avg = await computeWeightedAverage(pool, entityType, entityId);

  await pool.request()
    .input('score', sql.Decimal(3, 2), avg.WeightedRating || 0)
    .input('entityId', sql.Int, entityId)
    .query(`UPDATE ${target.table} SET TrustScore = @score WHERE ${target.id} = @entityId`);
}

async function checkVerifiedTrip(pool, reviewerId, entityType, entityId, tripId) {
  if (!tripId) return false;

  const result = await pool.request()
    .input('reviewerId', sql.Int, reviewerId)
    .input('tripId', sql.Int, tripId)
    .input('entityType', sql.NVarChar(30), entityType)
    .input('entityId', sql.Int, entityId)
    .query(`
      SELECT TOP 1 t.TripID
      FROM Trips t
      LEFT JOIN ItineraryDays d ON d.TripID = t.TripID
      LEFT JOIN ItineraryItems i ON i.DayID = d.DayID
      WHERE t.TripID = @tripId
        AND t.UserID = @reviewerId
        AND t.Status = 'completed'
        AND DATEDIFF(day, t.EndDate, GETDATE()) BETWEEN 0 AND 30
        AND (
          @entityType = 'city'
          OR (i.PlaceType = @entityType AND i.PlaceID = @entityId)
        );
    `);

  return result.recordset.length > 0;
}

exports.getReviews = async (req, res, next) => {
  try {
    const entityType = normaliseEntityType(req.params.entityType);
    const entityId = Number(req.params.entityId);
    const sort = String(req.query.sort || 'recent');

    if (!entityType || !Number.isInteger(entityId)) {
      return res.status(400).json({ message: 'Invalid entity type or entity id' });
    }

    let orderBy = 'r.CreatedAt DESC';
    if (sort === 'highest') orderBy = 'r.Rating DESC, r.CreatedAt DESC';
    if (sort === 'verified') orderBy = 'r.IsVerified DESC, r.CreatedAt DESC';

    const pool = await poolPromise;
    const summary = await computeWeightedAverage(pool, entityType, entityId);

    const result = await pool.request()
      .input('entityType', sql.NVarChar(30), entityType)
      .input('entityId', sql.Int, entityId)
      .query(`
        SELECT
          r.ReviewID, r.ReviewerID, u.DisplayName, u.Avatar, u.Role,
          r.EntityType, r.EntityID, r.TripID, r.Rating, r.Title, r.ReviewText,
          r.PhotoURLs, r.IsVerified, r.HelpfulCount, r.CreatedAt
        FROM Reviews r
        JOIN Users u ON u.UserID = r.ReviewerID
        WHERE r.EntityType = @entityType AND r.EntityID = @entityId
        ORDER BY ${orderBy};
      `);

    res.json({
      summary: {
        averageRating: Number(summary.WeightedRating || 0),
        reviewCount: Number(summary.ReviewCount || 0),
      },
      reviews: result.recordset,
    });
  } catch (err) {
    next(err);
  }
};

exports.createReview = async (req, res, next) => {
  try {
    const reviewerId = req.user?.id;
    const entityType = normaliseEntityType(req.body.entityType);
    const entityId = Number(req.body.entityId);
    const tripId = req.body.tripId ? Number(req.body.tripId) : null;
    const rating = Number(req.body.rating);
    const title = req.body.title || null;
    const reviewText = req.body.reviewText || null;
    const photoURLs = Array.isArray(req.body.photoURLs) ? JSON.stringify(req.body.photoURLs) : null;

    if (!reviewerId) return res.status(401).json({ message: 'Login required' });
    if (!entityType || !Number.isInteger(entityId)) return res.status(400).json({ message: 'Invalid entity' });
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating must be 1 to 5' });

    const pool = await poolPromise;
    const isVerified = await checkVerifiedTrip(pool, reviewerId, entityType, entityId, tripId);

    const result = await pool.request()
      .input('reviewerId', sql.Int, reviewerId)
      .input('entityType', sql.NVarChar(30), entityType)
      .input('entityId', sql.Int, entityId)
      .input('tripId', sql.Int, tripId)
      .input('rating', sql.TinyInt, rating)
      .input('title', sql.NVarChar(200), title)
      .input('reviewText', sql.NVarChar(sql.MAX), reviewText)
      .input('photoURLs', sql.NVarChar(sql.MAX), photoURLs)
      .input('isVerified', sql.Bit, isVerified ? 1 : 0)
      .query(`
        INSERT INTO Reviews (ReviewerID, EntityType, EntityID, TripID, Rating, Title, ReviewText, PhotoURLs, IsVerified)
        OUTPUT INSERTED.*
        VALUES (@reviewerId, @entityType, @entityId, @tripId, @rating, @title, @reviewText, @photoURLs, @isVerified);
      `);

    await updateTrustScore(pool, entityType, entityId);

    const badgeService = require('../services/badgeService');
    const reviewCount = await badgeService.getReviewCount(reviewerId);
    badgeService.checkAndAward(reviewerId, 'review_count', reviewCount, req.io).catch(console.error);

    // If reviewing a buddy, check their trust score for badges
    if (entityType === 'buddy') {
      const trustScore = await badgeService.getTrustScore(entityId);
      badgeService.checkAndAward(entityId, 'trust_score', trustScore, req.io).catch(console.error);
    }

    res.status(201).json({ review: result.recordset[0] });
  } catch (err) {
    next(err);
  }
};

exports.markHelpful = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const reviewId = Number(req.params.reviewId);
    if (!userId) return res.status(401).json({ message: 'Login required' });
    if (!Number.isInteger(reviewId)) return res.status(400).json({ message: 'Invalid review id' });

    const pool = await poolPromise;
    await pool.request()
      .input('reviewId', sql.Int, reviewId)
      .input('userId', sql.Int, userId)
      .query(`
        IF NOT EXISTS (SELECT 1 FROM ReviewHelpful WHERE ReviewID = @reviewId AND UserID = @userId)
        BEGIN
          INSERT INTO ReviewHelpful (ReviewID, UserID) VALUES (@reviewId, @userId);
          UPDATE Reviews SET HelpfulCount = HelpfulCount + 1 WHERE ReviewID = @reviewId;
        END;
      `);

    res.json({ message: 'Marked helpful' });
  } catch (err) {
    next(err);
  }
};

exports.getMyReviews = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Login required' });

    const pool = await poolPromise;
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT ReviewID, EntityType, EntityID, TripID, Rating, Title, ReviewText, IsVerified, HelpfulCount, CreatedAt
        FROM Reviews
        WHERE ReviewerID = @userId
        ORDER BY CreatedAt DESC;
      `);

    res.json({ reviews: result.recordset });
  } catch (err) {
    next(err);
  }
};
