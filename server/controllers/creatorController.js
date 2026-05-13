const { sql, poolPromise } = require('../db');

const allowedNiches = new Set([
  'adventure', 'food', 'budget', 'luxury', 'solo', 'family', 'photography', 'backpacking',
]);

function currentUserId(req) {
  return req.user?.id || req.user?.UserID || req.user?.userId;
}

function toIntOrNull(value) {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function cleanHandleValue(handle) {
  return String(handle || '').trim().replace(/^@/, '').toLowerCase();
}

async function registerCreator(req, res) {
  try {
    const userId = currentUserId(req);
    if (!userId) return res.status(401).json({ message: 'Login required' });

    const { handle, niche, socialInstagram, socialYouTube, bio } = req.body;

    const cleanHandle = cleanHandleValue(handle);
    const cleanNiche = niche ? String(niche).toLowerCase() : null;

    if (!cleanHandle) return res.status(400).json({ message: 'Creator handle is required' });
    if (cleanHandle.length < 3) return res.status(400).json({ message: 'Handle must be at least 3 characters' });
    if (!/^[a-z0-9._-]+$/.test(cleanHandle)) {
      return res.status(400).json({ message: 'Handle can only contain letters, numbers, dot, dash, and underscore' });
    }
    if (cleanNiche && !allowedNiches.has(cleanNiche)) {
      return res.status(400).json({ message: 'Unsupported creator niche' });
    }

    const pool = await poolPromise;

    const existing = await pool.request()
      .input('uid', sql.Int, userId)
      .query('SELECT CreatorID FROM dbo.CreatorProfiles WHERE CreatorID = @uid');

    if (existing.recordset.length > 0) {
      return res.status(409).json({ message: 'You are already registered as a creator' });
    }

    const handleExists = await pool.request()
      .input('handle', sql.NVarChar(50), cleanHandle)
      .query('SELECT CreatorID FROM dbo.CreatorProfiles WHERE Handle = @handle');

    if (handleExists.recordset.length > 0) {
      return res.status(409).json({ message: 'This creator handle is already taken' });
    }

    const tx = new sql.Transaction(pool);
    await tx.begin();

    try {
      await new sql.Request(tx)
        .input('uid', sql.Int, userId)
        .query(`
          UPDATE dbo.Users
          SET Role = 'creator'
          WHERE UserID = @uid
        `);

      const created = await new sql.Request(tx)
        .input('uid', sql.Int, userId)
        .input('handle', sql.NVarChar(50), cleanHandle)
        .input('niche', sql.NVarChar(50), cleanNiche)
        .input('ig', sql.NVarChar(255), socialInstagram || null)
        .input('yt', sql.NVarChar(255), socialYouTube || null)
        .input('bio', sql.NVarChar(sql.MAX), bio || null)
        .query(`
          INSERT INTO dbo.CreatorProfiles
            (CreatorID, Handle, Niche, SocialInstagram, SocialYouTube, Bio)
          OUTPUT INSERTED.*
          VALUES (@uid, @handle, @niche, @ig, @yt, @bio)
        `);

      await tx.commit();
      res.status(201).json({ creator: created.recordset[0] });
    } catch (err) {
      await tx.rollback();
      throw err;
    }
  } catch (err) {
    console.error('[registerCreator]', err);
    res.status(500).json({ message: 'Failed to register creator' });
  }
}

async function getMe(req, res) {
  try {
    const userId = currentUserId(req);
    if (!userId) return res.status(401).json({ message: 'Login required' });

    const pool = await poolPromise;
    const result = await pool.request()
      .input('uid', sql.Int, userId)
      .query(`
        SELECT
          cp.*,
          u.DisplayName,
          u.Email,
          u.Avatar,
          u.Role
        FROM dbo.CreatorProfiles cp
        INNER JOIN dbo.Users u ON u.UserID = cp.CreatorID
        WHERE cp.CreatorID = @uid
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Creator profile not found' });
    }

    res.json({ creator: result.recordset[0] });
  } catch (err) {
    console.error('[getMeCreator]', err);
    res.status(500).json({ message: 'Failed to load creator profile' });
  }
}

async function getCreatorById(req, res) {
  try {
    const creatorId = parseInt(req.params.id, 10);
    const pool = await poolPromise;

    const result = await pool.request()
      .input('cid', sql.Int, creatorId)
      .query(`
        SELECT
          cp.*,
          u.DisplayName,
          u.Avatar,
          u.Role
        FROM dbo.CreatorProfiles cp
        INNER JOIN dbo.Users u ON u.UserID = cp.CreatorID
        WHERE cp.CreatorID = @cid
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Creator not found' });
    }

    res.json({ creator: result.recordset[0] });
  } catch (err) {
    console.error('[getCreatorById]', err);
    res.status(500).json({ message: 'Failed to load creator' });
  }
}

async function getMyContent(req, res) {
  try {
    const userId = currentUserId(req);
    if (!userId) return res.status(401).json({ message: 'Login required' });

    const pool = await poolPromise;
    const result = await pool.request()
      .input('uid', sql.Int, userId)
      .query(`
        SELECT
          p.*,
          c.Name AS DestinationName
        FROM dbo.ContentPosts p
        LEFT JOIN dbo.Cities c ON c.CityID = p.DestinationCityID
        WHERE p.CreatorID = @uid
        ORDER BY p.CreatedAt DESC
      `);

    res.json({ posts: result.recordset });
  } catch (err) {
    console.error('[getMyContent]', err);
    res.status(500).json({ message: 'Failed to load creator content' });
  }
}

async function getMyAnalytics(req, res) {
  try {
    const userId = currentUserId(req);
    if (!userId) return res.status(401).json({ message: 'Login required' });

    const pool = await poolPromise;

    const profile = await pool.request()
      .input('uid', sql.Int, userId)
      .query('SELECT FollowerCount, TotalViews, IsVerified FROM dbo.CreatorProfiles WHERE CreatorID = @uid');

    if (profile.recordset.length === 0) {
      return res.status(404).json({ message: 'Creator profile not found' });
    }

    const stats = await pool.request()
      .input('uid', sql.Int, userId)
      .query(`
        SELECT
          COUNT(*) AS TotalPosts,
          ISNULL(SUM(ViewCount), 0) AS TotalViews,
          ISNULL(SUM(LikeCount), 0) AS TotalLikes,
          ISNULL(SUM(CommentCount), 0) AS TotalComments,
          CAST(ISNULL(SUM(ViewCount), 0) * 0.03 AS DECIMAL(10,2)) AS EstimatedEarnings
        FROM dbo.ContentPosts
        WHERE CreatorID = @uid;

        SELECT TOP 5
          PostID, Title, MediaType, ViewCount, LikeCount, CommentCount, CreatedAt
        FROM dbo.ContentPosts
        WHERE CreatorID = @uid
        ORDER BY ViewCount DESC, LikeCount DESC, CreatedAt DESC;
      `);

    res.json({
      summary: {
        ...profile.recordset[0],
        ...(stats.recordsets?.[0]?.[0] || {}),
      },
      topPosts: stats.recordsets?.[1] || [],
    });
  } catch (err) {
    console.error('[getMyAnalytics]', err);
    res.status(500).json({ message: 'Failed to load analytics' });
  }
}

async function getMyProducts(req, res) {
  try {
    const userId = currentUserId(req);
    if (!userId) return res.status(401).json({ message: 'Login required' });

    const pool = await poolPromise;
    const result = await pool.request()
      .input('uid', sql.Int, userId)
      .query(`
        SELECT *
        FROM dbo.CreatorProducts
        WHERE CreatorID = @uid
        ORDER BY CreatedAt DESC
      `);

    res.json({ products: result.recordset });
  } catch (err) {
    console.error('[getMyProducts]', err);
    res.status(500).json({ message: 'Failed to load marketplace products' });
  }
}

async function createProduct(req, res) {
  try {
    const userId = currentUserId(req);
    if (!userId) return res.status(401).json({ message: 'Login required' });

    const {
      title,
      description,
      productType = 'guide',
      priceAmount = 0,
      currencyCode = 'PKR',
      fileUrl,
      coverImageUrl,
    } = req.body;

    if (!title || !title.trim()) return res.status(400).json({ message: 'Product title is required' });

    const pool = await poolPromise;
    const result = await pool.request()
      .input('creatorId', sql.Int, userId)
      .input('title', sql.NVarChar(160), title.trim())
      .input('description', sql.NVarChar(sql.MAX), description || null)
      .input('productType', sql.NVarChar(30), productType)
      .input('priceAmount', sql.Decimal(10, 2), Number(priceAmount) || 0)
      .input('currencyCode', sql.Char(3), String(currencyCode || 'PKR').toUpperCase().slice(0, 3))
      .input('fileUrl', sql.NVarChar(sql.MAX), fileUrl || null)
      .input('coverImageUrl', sql.NVarChar(sql.MAX), coverImageUrl || null)
      .query(`
        INSERT INTO dbo.CreatorProducts
          (CreatorID, Title, Description, ProductType, PriceAmount, CurrencyCode, FileURL, CoverImageURL)
        OUTPUT INSERTED.*
        VALUES
          (@creatorId, @title, @description, @productType, @priceAmount, @currencyCode, @fileUrl, @coverImageUrl)
      `);

    res.status(201).json({ product: result.recordset[0] });
  } catch (err) {
    console.error('[createProduct]', err);
    res.status(500).json({ message: 'Failed to create product' });
  }
}

async function getMyCollabs(req, res) {
  try {
    const userId = currentUserId(req);
    if (!userId) return res.status(401).json({ message: 'Login required' });

    const pool = await poolPromise;
    const result = await pool.request()
      .input('uid', sql.Int, userId)
      .query(`
        SELECT
          cr.*,
          fromCp.Handle AS FromHandle,
          toCp.Handle AS ToHandle,
          c.Name AS DestinationName
        FROM dbo.CreatorCollabRequests cr
        INNER JOIN dbo.CreatorProfiles fromCp ON fromCp.CreatorID = cr.FromCreatorID
        INNER JOIN dbo.CreatorProfiles toCp ON toCp.CreatorID = cr.ToCreatorID
        LEFT JOIN dbo.Cities c ON c.CityID = cr.DestinationCityID
        WHERE cr.FromCreatorID = @uid OR cr.ToCreatorID = @uid
        ORDER BY cr.CreatedAt DESC
      `);

    res.json({ collabs: result.recordset });
  } catch (err) {
    console.error('[getMyCollabs]', err);
    res.status(500).json({ message: 'Failed to load collab requests' });
  }
}

async function createCollabRequest(req, res) {
  try {
    const userId = currentUserId(req);
    if (!userId) return res.status(401).json({ message: 'Login required' });

    const { toCreatorHandle, destinationCityId, message } = req.body;
    const handle = cleanHandleValue(toCreatorHandle);
    if (!handle) return res.status(400).json({ message: 'Creator handle is required' });

    const pool = await poolPromise;

    const to = await pool.request()
      .input('handle', sql.NVarChar(50), handle)
      .query('SELECT CreatorID FROM dbo.CreatorProfiles WHERE Handle = @handle');

    if (to.recordset.length === 0) return res.status(404).json({ message: 'Creator not found' });
    const toCreatorId = to.recordset[0].CreatorID;
    if (toCreatorId === userId) return res.status(400).json({ message: 'You cannot send a collab request to yourself' });

    const result = await pool.request()
      .input('fromId', sql.Int, userId)
      .input('toId', sql.Int, toCreatorId)
      .input('cityId', sql.Int, toIntOrNull(destinationCityId))
      .input('message', sql.NVarChar(sql.MAX), message || null)
      .query(`
        INSERT INTO dbo.CreatorCollabRequests
          (FromCreatorID, ToCreatorID, DestinationCityID, Message)
        OUTPUT INSERTED.*
        VALUES (@fromId, @toId, @cityId, @message)
      `);

    res.status(201).json({ collab: result.recordset[0] });
  } catch (err) {
    console.error('[createCollabRequest]', err);
    res.status(500).json({ message: 'Failed to create collab request' });
  }
}

async function respondToCollab(req, res) {
  try {
    const userId = currentUserId(req);
    const collabId = parseInt(req.params.collabId, 10);
    const { status } = req.body;

    if (!['accepted', 'declined', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const pool = await poolPromise;
    const result = await pool.request()
      .input('uid', sql.Int, userId)
      .input('collabId', sql.Int, collabId)
      .input('status', sql.NVarChar(20), status)
      .query(`
        UPDATE dbo.CreatorCollabRequests
        SET Status = @status, RespondedAt = SYSUTCDATETIME()
        OUTPUT INSERTED.*
        WHERE CollabID = @collabId
          AND (ToCreatorID = @uid OR FromCreatorID = @uid)
      `);

    if (result.recordset.length === 0) return res.status(404).json({ message: 'Collab request not found' });
    res.json({ collab: result.recordset[0] });
  } catch (err) {
    console.error('[respondToCollab]', err);
    res.status(500).json({ message: 'Failed to update collab request' });
  }
}

async function generateTravelLog(req, res) {
  try {
    const userId = currentUserId(req);
    const tripId = parseInt(req.params.tripId, 10);
    if (!userId) return res.status(401).json({ message: 'Login required' });
    if (!tripId) return res.status(400).json({ message: 'Invalid trip id' });

    let PDFDocument;
    try {
      PDFDocument = require('pdfkit');
    } catch (err) {
      return res.status(500).json({ message: 'pdfkit is not installed. Run: npm install pdfkit inside server folder.' });
    }

    const pool = await poolPromise;

    const tripResult = await pool.request()
      .input('uid', sql.Int, userId)
      .input('tid', sql.Int, tripId)
      .query(`
        SELECT TOP 1 *
        FROM dbo.Trips
        WHERE TripID = @tid AND UserID = @uid
      `);

    if (tripResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Trip not found for this user' });
    }

    const itineraryResult = await pool.request()
      .input('tid', sql.Int, tripId)
      .query(`
        IF OBJECT_ID('dbo.ItineraryItems', 'U') IS NOT NULL
          SELECT * FROM dbo.ItineraryItems WHERE TripID = @tid ORDER BY 1;
        ELSE
          SELECT CAST(NULL AS INT) AS EmptyResult WHERE 1 = 0;
      `);

    const trip = tripResult.recordset[0];
    const itinerary = itineraryResult.recordset || [];

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="travel-log-trip-${tripId}.pdf"`);

    const doc = new PDFDocument({ margin: 48 });
    doc.pipe(res);

    doc.fontSize(22).text('TravelBuddy Creator Travel Log', { align: 'center' });
    doc.moveDown();
    doc.fontSize(13).text(`Trip ID: ${tripId}`);
    doc.text(`Creator/User ID: ${userId}`);
    doc.text(`Generated: ${new Date().toLocaleString()}`);
    doc.moveDown();

    doc.fontSize(16).text('Trip Summary', { underline: true });
    doc.moveDown(0.5);
    Object.entries(trip).slice(0, 16).forEach(([key, value]) => {
      doc.fontSize(10).text(`${key}: ${value ?? ''}`);
    });

    doc.addPage();
    doc.fontSize(16).text('Day-by-Day / Itinerary Evidence', { underline: true });
    doc.moveDown();

    if (itinerary.length === 0) {
      doc.fontSize(11).text('No itinerary items found for this trip.');
    } else {
      itinerary.forEach((item, index) => {
        doc.fontSize(12).text(`Item ${index + 1}`, { underline: true });
        Object.entries(item).slice(0, 12).forEach(([key, value]) => {
          doc.fontSize(9).text(`${key}: ${value ?? ''}`);
        });
        doc.moveDown();
      });
    }

    doc.addPage();
    doc.fontSize(16).text('Accommodation Proof / Cost Summary', { underline: true });
    doc.moveDown();
    doc.fontSize(11).text('Attach hotel invoices, booking confirmations, receipts, and sponsor letters with this generated travel log when required.');

    doc.end();
  } catch (err) {
    console.error('[generateTravelLog]', err);
    if (!res.headersSent) res.status(500).json({ message: 'Failed to generate travel log' });
  }
}

module.exports = {
  registerCreator,
  getMe,
  getCreatorById,
  getMyContent,
  getMyAnalytics,
  getMyProducts,
  createProduct,
  getMyCollabs,
  createCollabRequest,
  respondToCollab,
  generateTravelLog,
};
