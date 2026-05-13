const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');
const redis = require('../redis');
const { optionalAuth } = require('../middleware/auth');
const { fetchAndCacheCityImage } = require('../services/imageService');

/**
 * GET /api/explore/popular
 * Returns top 8 cities by TrustScore (cached in Redis).
 */
router.get('/popular', async (req, res) => {
  try {
    const cached = await redis.get('explore:popular');
    if (cached) return res.json(JSON.parse(cached));

    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT TOP 8
        c.CityID,
        c.Name           AS CityName,
        c.ThumbnailURL,
        c.TrustScore,
        c.ReviewCount,
        c.AvgDailyBudget,
        c.BestSeasonVisit,
        co.Name          AS CountryName,
        co.FlagEmoji
      FROM Cities c
      JOIN Countries co ON c.CountryID = co.CountryID
      WHERE c.TrustScore > 0
      ORDER BY c.TrustScore DESC, c.ReviewCount DESC
    `);

    const data = result.recordset;

    // Trigger image fetching for missing thumbnails in background
    data.forEach(city => {
      if (!city.ThumbnailURL) {
        fetchAndCacheCityImage(city.CityID, city.CityName).catch(err => console.error(`Failed to fetch image for ${city.CityName}:`, err));
      }
    });

    await redis.set('explore:popular', JSON.stringify(data), 'EX', 3600);
    res.json(data);
  } catch (err) {
    console.error('Popular cities error:', err);
    res.status(500).json({ error: 'Failed to fetch popular cities' });
  }
});

/**
 * GET /api/explore/trending
 * Personalised trending cities based on user region or global default.
 */
router.get('/trending', optionalAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    let continentFilter = null;

    if (req.user) {
      const pool = await poolPromise;
      const userResult = await pool.request()
        .input('uid', sql.Int, req.user.id)
        .query(`
          SELECT co.Continent
          FROM Users u
          JOIN Cities hc ON u.HomeCity = hc.Name
          JOIN Countries co ON hc.CountryID = co.CountryID
          WHERE u.UserID = @uid
        `);
      if (userResult.recordset.length > 0) {
        continentFilter = userResult.recordset[0].Continent;
      }
    }

    const cacheKey = `explore:trending:${continentFilter || 'global'}`;
    const cached = await redis.get(cacheKey);
    if (cached) return res.json(JSON.parse(cached));

    const pool = await poolPromise;
    const request = pool.request();
    let query = `
      SELECT TOP ${limit}
        c.CityID,
        c.Name AS CityName,
        c.ThumbnailURL,
        c.TrustScore,
        c.ReviewCount,
        c.AvgDailyBudget,
        co.Name AS CountryName,
        co.FlagEmoji,
        co.Continent
      FROM Cities c
      JOIN Countries co ON c.CountryID = co.CountryID
    `;

    if (continentFilter) {
      query += ` WHERE co.Continent = @continent`;
      request.input('continent', sql.NVarChar, continentFilter);
    }

    query += ` ORDER BY c.TrustScore DESC, c.ReviewCount DESC`;

    const result = await request.query(query);
    const data = result.recordset;

    // Trigger image fetching for missing thumbnails in background
    data.forEach(city => {
      if (!city.ThumbnailURL) {
        fetchAndCacheCityImage(city.CityID, city.CityName).catch(err => console.error(`Failed to fetch image for ${city.CityName}:`, err));
      }
    });

    await redis.set(cacheKey, JSON.stringify(data), 'EX', 3600);
    res.json(data);
  } catch (err) {
    console.error('Trending cities error:', err);
    res.status(500).json({ error: 'Failed to fetch trending cities' });
  }
});

/**
 * GET /api/explore/search
 * Handles full-text search across cities, countries, and attractions.
 */
router.get('/search', async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) return res.json([]);

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('q', sql.NVarChar, `%${q}%`)
      .query(`
        SELECT TOP 10
          c.CityID,
          c.Name AS CityName,
          c.ThumbnailURL,
          c.TrustScore,
          co.Name AS CountryName,
          co.FlagEmoji,
          'city' AS EntityType
        FROM Cities c
        JOIN Countries co ON c.CountryID = co.CountryID
        WHERE c.Name LIKE @q OR co.Name LIKE @q

        UNION ALL

        SELECT TOP 5
          a.AttractionID AS CityID,
          a.Name AS CityName,
          a.ThumbnailURL,
          a.TrustScore,
          ci.Name AS CountryName,
          '' AS FlagEmoji,
          'attraction' AS EntityType
        FROM Attractions a
        JOIN Cities ci ON a.CityID = ci.CityID
        WHERE a.Name LIKE @q
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Search failed' });
  }
});

/**
 * GET /api/explore/filter
 * Filter by Continent, Style, Budget, Season.
 */
router.get('/filter', async (req, res) => {
  const { continent, budgetMax, season } = req.query;

  try {
    const pool = await poolPromise;
    const request = pool.request();
    let conditions = [];

    if (continent) {
      conditions.push(`co.Continent = @continent`);
      request.input('continent', sql.NVarChar, continent);
    }
    if (budgetMax) {
      conditions.push(`c.AvgDailyBudget <= @budgetMax`);
      request.input('budgetMax', sql.Decimal, parseFloat(budgetMax));
    }
    if (season) {
      conditions.push(`c.BestSeasonVisit LIKE @season`);
      request.input('season', sql.NVarChar, `%${season}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await request.query(`
      SELECT TOP 20
        c.CityID,
        c.Name AS CityName,
        c.ThumbnailURL,
        c.TrustScore,
        c.ReviewCount,
        c.AvgDailyBudget,
        c.BestSeasonVisit,
        co.Name AS CountryName,
        co.FlagEmoji
      FROM Cities c
      JOIN Countries co ON c.CountryID = co.CountryID
      ${whereClause}
      ORDER BY c.TrustScore DESC
    `);

    res.json(result.recordset);
  } catch (err) {
    console.error('Filter error:', err);
    res.status(500).json({ error: 'Filter failed' });
  }
});

/**
 * GET /api/explore/featured
 * Returns a daily featured city (cached for 24h).
 */
router.get('/featured', async (req, res) => {
  try {
    const cached = await redis.get('explore:featured');
    if (cached) return res.json(JSON.parse(cached));

    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT TOP 1
        c.CityID,
        c.Name AS CityName,
        c.Description,
        c.ThumbnailURL,
        c.TrustScore,
        c.ReviewCount,
        c.AvgDailyBudget,
        c.BestSeasonVisit,
        co.Name AS CountryName,
        co.FlagEmoji
      FROM Cities c
      JOIN Countries co ON c.CountryID = co.CountryID
      WHERE c.TrustScore >= 4.0
      ORDER BY NEWID()
    `);

    const data = result.recordset[0];
    if (data) {
      if (!data.ThumbnailURL) {
        data.ThumbnailURL = await fetchAndCacheCityImage(data.CityID, data.CityName).catch(() => '/images/placeholder-city.jpg');
      }
      await redis.set('explore:featured', JSON.stringify(data), 'EX', 86400);
    }
    res.json(data);
  } catch (err) {
    console.error('Featured city error:', err);
    res.status(500).json({ error: 'Failed to fetch featured city' });
  }
});

/**
 * GET /api/explore/vlogger-content
 * Trending vlogger content by destination.
 */
router.get('/vlogger-content', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT TOP 12
        cp.PostID,
        cp.Title,
        cp.ThumbnailURL,
        cp.ViewCount,
        cp.LikeCount,
        cp.MediaType,
        cr.Handle AS CreatorHandle,
        cr.IsVerified,
        c.CityID,
        c.Name AS CityName,
        co.Name AS CountryName
      FROM ContentPosts cp
      JOIN CreatorProfiles cr ON cp.CreatorID = cr.CreatorID
      JOIN Cities c           ON cp.DestinationCityID = c.CityID
      JOIN Countries co       ON c.CountryID = co.CountryID
      WHERE cp.IsPublished = 1
        AND cp.DestinationCityID IS NOT NULL
      ORDER BY cp.ViewCount DESC
    `);

    res.json(result.recordset);
  } catch (err) {
    console.error('Vlogger content error:', err);
    res.status(500).json({ error: 'Failed to fetch vlogger content' });
  }
});

module.exports = router;
