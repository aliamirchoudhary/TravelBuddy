const { sql, poolPromise } = require('../db');

function currentUserId(req) {
  return req.user?.id || req.user?.UserID || req.user?.userId;
}

function normalizeMediaType(type, file) {
  if (file?.mimetype?.startsWith('video/')) return 'video';
  if (file?.mimetype?.startsWith('image/')) return 'photo';

  const t = String(type || '').toLowerCase();
  if (['video', 'photo', 'photoset', 'travellog'].includes(t)) return t;
  return 'photo';
}

function toIntOrNull(value) {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

async function ensureCreator(pool, userId) {
  const creator = await pool.request()
    .input('uid', sql.Int, userId)
    .query('SELECT CreatorID FROM dbo.CreatorProfiles WHERE CreatorID = @uid');

  return creator.recordset[0] || null;
}

async function uploadContent(req, res) {
  try {
    const userId = currentUserId(req);
    if (!userId) return res.status(401).json({ message: 'Login required' });

    const pool = await poolPromise;
    const creator = await ensureCreator(pool, userId);
    if (!creator) {
      return res.status(403).json({ message: 'Become a creator before uploading content' });
    }

    const {
      title,
      description,
      mediaType,
      mediaUrl,
      thumbnailUrl,
      tripId,
      destinationCityId,
      isPublished = true,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const uploadedFile = req.file;
    const finalMediaUrl = uploadedFile?.path || uploadedFile?.secure_url || mediaUrl;
    const cloudinaryPublicId = uploadedFile?.filename || uploadedFile?.public_id || null;

    if (!finalMediaUrl || !String(finalMediaUrl).trim()) {
      return res.status(400).json({ message: 'Upload a media file or provide a media URL' });
    }

    const finalMediaType = normalizeMediaType(mediaType, uploadedFile);

    const result = await pool.request()
      .input('creatorId', sql.Int, userId)
      .input('tripId', sql.Int, toIntOrNull(tripId))
      .input('title', sql.NVarChar(200), title.trim())
      .input('description', sql.NVarChar(sql.MAX), description || null)
      .input('mediaType', sql.NVarChar(20), finalMediaType)
      .input('mediaUrl', sql.NVarChar(sql.MAX), String(finalMediaUrl).trim())
      .input('thumbnailUrl', sql.NVarChar(sql.MAX), thumbnailUrl || null)
      .input('cloudinaryPublicId', sql.NVarChar(255), cloudinaryPublicId)
      .input('cityId', sql.Int, toIntOrNull(destinationCityId))
      .input('isPublished', sql.Bit, String(isPublished) !== 'false')
      .query(`
        INSERT INTO dbo.ContentPosts
          (CreatorID, TripID, Title, Description, MediaType, MediaURL, ThumbnailURL, CloudinaryPublicID, DestinationCityID, IsPublished)
        OUTPUT INSERTED.*
        VALUES
          (@creatorId, @tripId, @title, @description, @mediaType, @mediaUrl, @thumbnailUrl, @cloudinaryPublicId, @cityId, @isPublished)
      `);

    res.status(201).json({ post: result.recordset[0] });
  } catch (err) {
    console.error('[uploadContent]', err);
    res.status(500).json({ message: err.message || 'Failed to upload content' });
  }
}

async function getPublicFeed(req, res) {
  try {
    const pool = await poolPromise;
    const limit = Math.min(parseInt(req.query.limit, 10) || 30, 100);

    const result = await pool.request()
      .input('limit', sql.Int, limit)
      .query(`
        SELECT TOP (@limit)
          p.PostID,
          p.CreatorID,
          p.TripID,
          p.Title,
          p.Description,
          p.MediaType,
          p.MediaURL,
          p.ThumbnailURL,
          p.DestinationCityID,
          p.ViewCount,
          p.LikeCount,
          p.CommentCount,
          p.IsPublished,
          p.CreatedAt,
          cp.Handle,
          cp.Niche,
          cp.IsVerified,
          cp.FollowerCount,
          u.DisplayName,
          u.Avatar,
          c.Name AS DestinationName
        FROM dbo.ContentPosts p
        INNER JOIN dbo.CreatorProfiles cp ON cp.CreatorID = p.CreatorID
        INNER JOIN dbo.Users u ON u.UserID = p.CreatorID
        LEFT JOIN dbo.Cities c ON c.CityID = p.DestinationCityID
        WHERE p.IsPublished = 1
        ORDER BY
          ((DATEDIFF(HOUR, p.CreatedAt, SYSUTCDATETIME()) * -0.40)
           + ((p.LikeCount + p.CommentCount) * 0.30)
           + (p.ViewCount * 0.05)) DESC,
          p.CreatedAt DESC
      `);

    res.json({ posts: result.recordset });
  } catch (err) {
    console.error('[getPublicFeed]', err);
    res.status(500).json({ message: 'Failed to load creator feed' });
  }
}

async function incrementView(req, res) {
  try {
    const postId = parseInt(req.params.postId, 10);
    if (!postId) return res.status(400).json({ message: 'Invalid post id' });

    const pool = await poolPromise;
    const result = await pool.request()
      .input('pid', sql.Int, postId)
      .query(`
        UPDATE dbo.ContentPosts
        SET ViewCount = ViewCount + 1
        OUTPUT INSERTED.PostID, INSERTED.CreatorID, INSERTED.ViewCount
        WHERE PostID = @pid;
      `);

    const updated = result.recordset[0];
    if (updated) {
      await pool.request()
        .input('cid', sql.Int, updated.CreatorID)
        .query(`
          UPDATE dbo.CreatorProfiles
          SET TotalViews = (
            SELECT ISNULL(SUM(ViewCount), 0)
            FROM dbo.ContentPosts
            WHERE CreatorID = @cid
          )
          WHERE CreatorID = @cid;
        `);
    }

    res.json({ ok: true, viewCount: updated?.ViewCount || 0 });
  } catch (err) {
    console.error('[incrementView]', err);
    res.status(500).json({ message: 'Failed to update view count' });
  }
}

async function toggleLike(req, res) {
  try {
    const userId = currentUserId(req);
    const postId = parseInt(req.params.postId, 10);
    if (!userId) return res.status(401).json({ message: 'Login required' });
    if (!postId) return res.status(400).json({ message: 'Invalid post id' });

    const pool = await poolPromise;
    const tx = new sql.Transaction(pool);
    await tx.begin();

    try {
      const existing = await new sql.Request(tx)
        .input('pid', sql.Int, postId)
        .input('uid', sql.Int, userId)
        .query('SELECT PostID FROM dbo.ContentLikes WHERE PostID = @pid AND UserID = @uid');

      let liked;

      if (existing.recordset.length > 0) {
        await new sql.Request(tx)
          .input('pid', sql.Int, postId)
          .input('uid', sql.Int, userId)
          .query('DELETE FROM dbo.ContentLikes WHERE PostID = @pid AND UserID = @uid');
        liked = false;
      } else {
        await new sql.Request(tx)
          .input('pid', sql.Int, postId)
          .input('uid', sql.Int, userId)
          .query('INSERT INTO dbo.ContentLikes (PostID, UserID) VALUES (@pid, @uid)');
        liked = true;
      }

      const counts = await new sql.Request(tx)
        .input('pid', sql.Int, postId)
        .query('SELECT LikeCount FROM dbo.ContentPosts WHERE PostID = @pid');

      await tx.commit();
      res.json({ liked, likeCount: counts.recordset[0]?.LikeCount || 0 });
    } catch (err) {
      await tx.rollback();
      throw err;
    }
  } catch (err) {
    console.error('[toggleLike]', err);
    res.status(500).json({ message: 'Failed to update like' });
  }
}

async function getComments(req, res) {
  try {
    const postId = parseInt(req.params.postId, 10);
    const pool = await poolPromise;

    const result = await pool.request()
      .input('pid', sql.Int, postId)
      .query(`
        SELECT
          cc.CommentID,
          cc.PostID,
          cc.UserID,
          cc.CommentText,
          cc.CreatedAt,
          cc.ParentCommentID,
          u.DisplayName,
          u.Avatar
        FROM dbo.ContentComments cc
        INNER JOIN dbo.Users u ON u.UserID = cc.UserID
        WHERE cc.PostID = @pid
        ORDER BY cc.CreatedAt ASC
      `);

    res.json({ comments: result.recordset });
  } catch (err) {
    console.error('[getComments]', err);
    res.status(500).json({ message: 'Failed to load comments' });
  }
}

async function addComment(req, res) {
  try {
    const userId = currentUserId(req);
    const postId = parseInt(req.params.postId, 10);
    const { commentText, parentCommentId } = req.body;

    if (!userId) return res.status(401).json({ message: 'Login required' });
    if (!commentText || !commentText.trim()) return res.status(400).json({ message: 'Comment text is required' });

    const pool = await poolPromise;
    const result = await pool.request()
      .input('pid', sql.Int, postId)
      .input('uid', sql.Int, userId)
      .input('txt', sql.NVarChar(sql.MAX), commentText.trim())
      .input('parent', sql.Int, toIntOrNull(parentCommentId))
      .query(`
        INSERT INTO dbo.ContentComments (PostID, UserID, CommentText, ParentCommentID)
        OUTPUT INSERTED.*
        VALUES (@pid, @uid, @txt, @parent)
      `);

    res.status(201).json({ comment: result.recordset[0] });
  } catch (err) {
    console.error('[addComment]', err);
    res.status(500).json({ message: 'Failed to add comment' });
  }
}

module.exports = {
  uploadContent,
  getPublicFeed,
  incrementView,
  toggleLike,
  getComments,
  addComment,
};
