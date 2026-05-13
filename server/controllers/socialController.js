const { sql, poolPromise } = require('../db');

function getUserId(req) {
  return req.user?.id || req.user?.UserID || req.user?.userId || null;
}

function getFallbackFeed(filter = 'Trending') {
  const all = [
    {
      id: 'demo-1', sourceType: 'creator', title: 'Cherry blossom morning in Kyoto',
      authorName: 'Mia Chen', avatar: '📸', location: 'Kyoto, Japan', destination: 'Kyoto',
      content: "Cherry blossom season in Kyoto is absolutely surreal — woke up at 4am to catch this view before the crowds.",
      mediaType: 'photo', thumbnailUrl: '', likes: 2341, comments: 89, views: 14800,
      tag: 'Culture', color: '#7B61FF', badge: 'Verified Traveler', createdAt: new Date().toISOString(), score: 98
    },
    {
      id: 'demo-2', sourceType: 'creator', title: 'Torres del Paine trek diary',
      authorName: 'Alex Rivera', avatar: '🏔️', location: 'Patagonia, Argentina', destination: 'Patagonia',
      content: "Day 8 of the Torres del Paine trek. My legs are destroyed but this view makes everything worth it.",
      mediaType: 'video', thumbnailUrl: '', likes: 1876, comments: 56, views: 11400,
      tag: 'Adventure', color: '#00E887', badge: 'Explorer', createdAt: new Date().toISOString(), score: 91
    },
    {
      id: 'demo-3', sourceType: 'group', title: 'Budget Marrakech tips',
      authorName: 'Fatima Al-Hassan', avatar: '🌺', location: 'Marrakech, Morocco', destination: 'Marrakech',
      content: "The medina at golden hour is pure magic. Budget at least 3 days in Marrakech alone.",
      mediaType: 'photo', thumbnailUrl: '', likes: 3102, comments: 142, views: 16200,
      tag: 'Culture', color: '#FFD166', badge: 'Top Reviewer', createdAt: new Date().toISOString(), score: 95
    },
    {
      id: 'demo-4', sourceType: 'creator', title: 'Maldives snorkeling guide',
      authorName: 'Jake Thompson', avatar: '🤿', location: 'Maldives', destination: 'Maldives',
      content: "Underwater life here is unreal. Full snorkeling guide coming soon with gear recommendations and budget tips.",
      mediaType: 'video', thumbnailUrl: '', likes: 4230, comments: 203, views: 22000,
      tag: 'Beach', color: '#00D4FF', badge: 'Vlogger · 120k', createdAt: new Date().toISOString(), score: 99
    }
  ];

  if (!filter || filter === 'Trending' || filter === 'Following') return all;
  if (filter === 'Recent') return [...all].reverse();
  return all.filter(p => p.tag.toLowerCase() === filter.toLowerCase());
}

function getFallbackSidebar() {
  return {
    popularPlaces: [
      { CityID: 1, Name: 'Santorini', CountryName: 'Greece', FlagEmoji: '🇬🇷', TrustScore: 4.9, PostCount: '12.4k' },
      { CityID: 2, Name: 'Bali', CountryName: 'Indonesia', FlagEmoji: '🇮🇩', TrustScore: 4.9, PostCount: '18.2k' },
      { CityID: 3, Name: 'Kyoto', CountryName: 'Japan', FlagEmoji: '🇯🇵', TrustScore: 4.8, PostCount: '9.8k' },
      { CityID: 4, Name: 'Marrakech', CountryName: 'Morocco', FlagEmoji: '🇲🇦', TrustScore: 4.8, PostCount: '6.7k' },
      { CityID: 5, Name: 'Maldives', CountryName: 'Maldives', FlagEmoji: '🇲🇻', TrustScore: 5.0, PostCount: '22.1k' }
    ],
    featuredVloggers: [
      { CreatorID: 1, Handle: 'Nomad Kai', Niche: 'Adventure', FollowerCount: 340000, IsVerified: true },
      { CreatorID: 2, Handle: 'Travel with Zara', Niche: 'Culture', FollowerCount: 210000, IsVerified: true },
      { CreatorID: 3, Handle: 'The Beach Seeker', Niche: 'Beach', FollowerCount: 185000, IsVerified: false }
    ],
    trendingTags: ['Adventure', 'Culture', 'Beach', 'Budget', 'Food'],
    leaderboard: [
      { UserName: 'Alex R.', BadgeName: '5 Continents', BadgeEmoji: '🌍' },
      { UserName: 'Fatima H.', BadgeName: 'Top Reviewer', BadgeEmoji: '⭐' },
      { UserName: 'Mia C.', BadgeName: '10 Buddy Matches', BadgeEmoji: '🤝' }
    ]
  };
}

async function getFeed(req, res) {
  try {
    const { filter = 'Trending', take = 20 } = req.query;
    const userId = getUserId(req);
    const pool = await poolPromise;

    const request = pool.request()
      .input('take', sql.Int, Math.min(parseInt(take, 10) || 20, 50))
      .input('filter', sql.NVarChar(40), filter)
      .input('userId', sql.Int, userId || 0);

    const result = await request.query(`
      ;WITH CreatorFeed AS (
        SELECT TOP (@take)
          CAST(cp.PostID AS NVARCHAR(40)) AS ID,
          'creator' AS SourceType,
          cp.PostID AS SourceID,
          cp.Title,
          cp.Description AS Content,
          cp.MediaType,
          cp.MediaURL,
          cp.ThumbnailURL,
          cp.ViewCount,
          cp.LikeCount,
          cp.CommentCount,
          cp.CreatedAt,
          c.CityID,
          c.Name AS DestinationName,
          co.Name AS CountryName,
          u.DisplayName AS AuthorName,
          cr.Handle,
          cr.Niche AS Tag,
          cr.IsVerified,
          CAST((
            CASE WHEN DATEDIFF(HOUR, cp.CreatedAt, SYSUTCDATETIME()) <= 24 THEN 40 ELSE 10 END +
            CASE WHEN cp.ViewCount > 0 THEN ((cp.LikeCount + cp.CommentCount) * 30.0 / cp.ViewCount) ELSE 0 END +
            CASE WHEN @filter IN ('Trending','Following','Recent') OR cr.Niche = LOWER(@filter) THEN 30 ELSE 0 END
          ) AS DECIMAL(10,2)) AS RankScore
        FROM dbo.ContentPosts cp
        INNER JOIN dbo.CreatorProfiles cr ON cr.CreatorID = cp.CreatorID
        INNER JOIN dbo.Users u ON u.UserID = cp.CreatorID
        LEFT JOIN dbo.Cities c ON c.CityID = cp.DestinationCityID
        LEFT JOIN dbo.Countries co ON co.CountryID = c.CountryID
        WHERE cp.IsPublished = 1
          AND (@filter IN ('Trending','Following','Recent') OR cr.Niche = LOWER(@filter))
      ),
      GroupFeed AS (
        SELECT TOP (@take)
          CONCAT('g-', gp.PostID) AS ID,
          'group' AS SourceType,
          gp.PostID AS SourceID,
          g.Name AS Title,
          gp.Content,
          'group' AS MediaType,
          gp.MediaURLs AS MediaURL,
          g.CoverImageURL AS ThumbnailURL,
          0 AS ViewCount,
          gp.LikeCount,
          gp.CommentCount,
          gp.CreatedAt,
          NULL AS CityID,
          g.Name AS DestinationName,
          NULL AS CountryName,
          u.DisplayName AS AuthorName,
          g.Name AS Handle,
          'Community' AS Tag,
          g.IsOfficial AS IsVerified,
          CAST((
            CASE WHEN DATEDIFF(HOUR, gp.CreatedAt, SYSUTCDATETIME()) <= 24 THEN 40 ELSE 10 END +
            CASE WHEN (gp.LikeCount + gp.CommentCount) > 0 THEN 30 ELSE 0 END +
            CASE WHEN @filter IN ('Trending','Following','Recent') THEN 30 ELSE 0 END
          ) AS DECIMAL(10,2)) AS RankScore
        FROM dbo.GroupPosts gp
        INNER JOIN dbo.Groups g ON g.GroupID = gp.GroupID
        INNER JOIN dbo.Users u ON u.UserID = gp.UserID
        WHERE @filter IN ('Trending','Following','Recent')
      )
      SELECT TOP (@take) *
      FROM (
        SELECT * FROM CreatorFeed
        UNION ALL
        SELECT * FROM GroupFeed
      ) x
      ORDER BY
        CASE WHEN @filter = 'Recent' THEN DATEDIFF(SECOND, '20000101', CreatedAt) END DESC,
        CASE WHEN @filter <> 'Recent' THEN RankScore END DESC,
        CreatedAt DESC;
    `);

    const posts = result.recordset.map((row) => ({
      id: row.ID,
      sourceType: row.SourceType,
      sourceId: row.SourceID,
      title: row.Title,
      authorName: row.AuthorName || row.Handle || 'TravelBuddy User',
      avatar: row.SourceType === 'group' ? '👥' : '🎥',
      location: row.CountryName ? `${row.DestinationName}, ${row.CountryName}` : row.DestinationName || 'TravelBuddy',
      destination: row.DestinationName,
      content: row.Content || '',
      mediaType: row.MediaType,
      mediaUrl: row.MediaURL,
      thumbnailUrl: row.ThumbnailURL,
      likes: row.LikeCount || 0,
      comments: row.CommentCount || 0,
      views: row.ViewCount || 0,
      tag: row.Tag || 'Travel',
      color: row.SourceType === 'group' ? '#00E887' : '#00D4FF',
      badge: row.IsVerified ? 'Verified' : row.SourceType === 'group' ? 'Community' : 'Creator',
      createdAt: row.CreatedAt,
      score: row.RankScore || 0
    }));

    res.json({ posts });
  } catch (err) {
    console.error('[Social:getFeed]', err);
    res.json({ posts: getFallbackFeed(req.query.filter) });
  }
}

async function getGroups(req, res) {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT TOP 20 GroupID, Name, Description, CoverImageURL, MemberCount, IsOfficial, CreatedAt
      FROM dbo.Groups
      ORDER BY IsOfficial DESC, MemberCount DESC, Name ASC
    `);
    res.json({ groups: result.recordset });
  } catch (err) {
    console.error('[Social:getGroups]', err);
    res.json({ groups: [
      { GroupID: 1, Name: 'Solo Travellers Pakistan', MemberCount: 14200, IsOfficial: true, Description: 'Find safe solo travel advice and buddies.' },
      { GroupID: 2, Name: 'Honeymoon Travel', MemberCount: 8900, IsOfficial: true, Description: 'Romantic trip ideas and planning.' },
      { GroupID: 3, Name: 'Backpackers Hub', MemberCount: 22100, IsOfficial: true, Description: 'Budget routes, hostels and backpacking help.' },
      { GroupID: 4, Name: 'Family Travel', MemberCount: 9600, IsOfficial: true, Description: 'Family-friendly destinations and tips.' },
      { GroupID: 5, Name: 'Budget Travel', MemberCount: 17800, IsOfficial: true, Description: 'Save money and travel smarter.' }
    ] });
  }
}

async function getSidebar(req, res) {
  try {
    const pool = await poolPromise;
    const [places, creators, groups] = await Promise.all([
      pool.request().query(`
        SELECT TOP 5 c.CityID, c.Name, co.Name AS CountryName, co.FlagEmoji,
               ISNULL(c.TrustScore, 4.5) AS TrustScore,
               COUNT(cp.PostID) AS PostCount
        FROM dbo.Cities c
        LEFT JOIN dbo.Countries co ON co.CountryID = c.CountryID
        LEFT JOIN dbo.ContentPosts cp ON cp.DestinationCityID = c.CityID AND cp.IsPublished = 1
        GROUP BY c.CityID, c.Name, co.Name, co.FlagEmoji, c.TrustScore
        ORDER BY COUNT(cp.PostID) DESC, ISNULL(c.TrustScore, 4.5) DESC
      `),
      pool.request().query(`
        SELECT TOP 5 cr.CreatorID, cr.Handle, cr.Niche, cr.FollowerCount, cr.IsVerified, u.DisplayName
        FROM dbo.CreatorProfiles cr
        INNER JOIN dbo.Users u ON u.UserID = cr.CreatorID
        ORDER BY cr.IsVerified DESC, cr.FollowerCount DESC, cr.TotalViews DESC
      `),
      pool.request().query(`
        SELECT TOP 5 GroupID, Name, MemberCount, IsOfficial
        FROM dbo.Groups
        ORDER BY IsOfficial DESC, MemberCount DESC
      `)
    ]);

    res.json({
      popularPlaces: places.recordset,
      featuredVloggers: creators.recordset,
      activeGroups: groups.recordset,
      trendingTags: ['Adventure', 'Culture', 'Beach', 'Budget', 'Food'],
      leaderboard: [
        { UserName: 'Top Creator', BadgeName: 'Most Viewed', BadgeEmoji: '🏆' },
        { UserName: 'Top Reviewer', BadgeName: 'Helpful Reviews', BadgeEmoji: '⭐' },
        { UserName: 'Community Lead', BadgeName: 'Group Builder', BadgeEmoji: '👥' }
      ]
    });
  } catch (err) {
    console.error('[Social:getSidebar]', err);
    res.json(getFallbackSidebar());
  }
}

async function joinGroup(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: 'Login required' });

    const groupId = parseInt(req.params.groupId, 10);
    const pool = await poolPromise;

    await pool.request()
      .input('gid', sql.Int, groupId)
      .input('uid', sql.Int, userId)
      .query(`
        IF NOT EXISTS (SELECT 1 FROM dbo.GroupMembers WHERE GroupID=@gid AND UserID=@uid)
        BEGIN
          INSERT INTO dbo.GroupMembers (GroupID, UserID, Role) VALUES (@gid, @uid, 'member');
          UPDATE dbo.Groups SET MemberCount = MemberCount + 1 WHERE GroupID=@gid;
        END
      `);

    try {
      const groupDetails = await pool.request().input('gid', sql.Int, groupId).query('SELECT OwnerID as CreatedByUserID, MemberCount FROM dbo.Groups WHERE GroupID = @gid');
      if (groupDetails.recordset.length > 0) {
        const { CreatedByUserID, MemberCount } = groupDetails.recordset[0];
        if (CreatedByUserID) {
          const badgeService = require('../services/badgeService');
          badgeService.checkAndAward(CreatedByUserID, 'group_members', MemberCount, req.io).catch(console.error);
        }
      }
    } catch (err) {
      // Ignore if OwnerID doesn't exist
    }

    res.json({ message: 'Joined group successfully' });
  } catch (err) {
    console.error('[Social:joinGroup]', err);
    res.status(500).json({ message: 'Failed to join group' });
  }
}

async function createGroupPost(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: 'Login required' });

    const groupId = parseInt(req.params.groupId, 10);
    const { content, mediaURLs } = req.body;
    if (!content?.trim()) return res.status(400).json({ message: 'Post content is required' });

    const pool = await poolPromise;
    const result = await pool.request()
      .input('gid', sql.Int, groupId)
      .input('uid', sql.Int, userId)
      .input('content', sql.NVarChar(sql.MAX), content.trim())
      .input('media', sql.NVarChar(sql.MAX), mediaURLs || null)
      .query(`
        INSERT INTO dbo.GroupPosts (GroupID, UserID, Content, MediaURLs)
        OUTPUT INSERTED.*
        VALUES (@gid, @uid, @content, @media)
      `);

    res.status(201).json({ post: result.recordset[0] });
  } catch (err) {
    console.error('[Social:createGroupPost]', err);
    res.status(500).json({ message: 'Failed to create group post' });
  }
}

async function trackIntent(req, res) {
  try {
    const userId = getUserId(req);
    const { destination, sourceType, sourceId, eventName = 'want_to_go_here' } = req.body;

    const pool = await poolPromise;
    await pool.request()
      .input('uid', sql.Int, userId)
      .input('event', sql.NVarChar(80), eventName)
      .input('dest', sql.NVarChar(160), destination || null)
      .input('stype', sql.NVarChar(40), sourceType || null)
      .input('sid', sql.NVarChar(80), sourceId ? String(sourceId) : null)
      .query(`
        INSERT INTO dbo.SocialAnalyticsEvents (UserID, EventName, DestinationName, SourceType, SourceID)
        VALUES (@uid, @event, @dest, @stype, @sid)
      `);

    res.json({ ok: true });
  } catch (err) {
    console.error('[Social:trackIntent]', err);
    res.json({ ok: false });
  }
}

async function followUser(req, res) {
  try {
    const followerId = getUserId(req);
    if (!followerId) return res.status(401).json({ message: 'Login required' });

    const followingId = parseInt(req.body.userId || req.body.followingId || req.params.userId, 10);
    if (!followingId || followerId === followingId) {
      return res.status(400).json({ message: 'Invalid following ID' });
    }

    const pool = await poolPromise;
    await pool.request()
      .input('fid', sql.Int, followerId)
      .input('foid', sql.Int, followingId)
      .query(`
        IF NOT EXISTS (SELECT 1 FROM dbo.UserFollows WHERE FollowerID=@fid AND FollowingID=@foid)
        BEGIN
          INSERT INTO dbo.UserFollows (FollowerID, FollowingID) VALUES (@fid, @foid);
          
          IF EXISTS (SELECT 1 FROM dbo.CreatorProfiles WHERE CreatorID = @foid)
            UPDATE dbo.CreatorProfiles SET FollowerCount = FollowerCount + 1 WHERE CreatorID = @foid;
        END
      `);

    res.json({ success: true, message: 'Followed successfully' });
  } catch (err) {
    console.error('[Social:followUser]', err);
    res.status(500).json({ message: 'Failed to follow user' });
  }
}

async function unfollowUser(req, res) {
  try {
    const followerId = getUserId(req);
    if (!followerId) return res.status(401).json({ message: 'Login required' });

    const followingId = parseInt(req.body.userId || req.body.followingId || req.params.userId, 10);
    const pool = await poolPromise;

    await pool.request()
      .input('fid', sql.Int, followerId)
      .input('foid', sql.Int, followingId)
      .query(`
        IF EXISTS (SELECT 1 FROM dbo.UserFollows WHERE FollowerID=@fid AND FollowingID=@foid)
        BEGIN
          DELETE FROM dbo.UserFollows WHERE FollowerID=@fid AND FollowingID=@foid;
          
          IF EXISTS (SELECT 1 FROM dbo.CreatorProfiles WHERE CreatorID = @foid)
            UPDATE dbo.CreatorProfiles SET FollowerCount = CASE WHEN FollowerCount > 0 THEN FollowerCount - 1 ELSE 0 END WHERE CreatorID = @foid;
        END
      `);

    res.json({ success: true, message: 'Unfollowed successfully' });
  } catch (err) {
    console.error('[Social:unfollowUser]', err);
    res.status(500).json({ message: 'Failed to unfollow user' });
  }
}

module.exports = {
  getFeed,
  getGroups,
  getSidebar,
  joinGroup,
  createGroupPost,
  trackIntent,
  followUser,
  unfollowUser,
};
