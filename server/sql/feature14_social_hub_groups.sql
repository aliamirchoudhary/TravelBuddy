/*
  TravelBuddy Feature 14 — Social Hub, Groups & Community Feed
  Purpose: Schema-only patch for Azure SQL Server integration.

  Do not run this locally unless your base TravelBuddy schema already exists.
  Expected existing tables: Users, Cities, Countries.
  Optional but recommended previous features: ContentPosts from Feature 12, Reviews from Feature 13.
*/

/* 1) Themed travel groups */
IF OBJECT_ID('dbo.Groups', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Groups (
        GroupID INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        Name NVARCHAR(120) NOT NULL UNIQUE,
        Description NVARCHAR(MAX) NULL,
        CoverImageURL NVARCHAR(MAX) NULL,
        CreatedByUserID INT NULL,
        MemberCount INT NOT NULL CONSTRAINT DF_Groups_MemberCount DEFAULT 0,
        IsOfficial BIT NOT NULL CONSTRAINT DF_Groups_IsOfficial DEFAULT 0,
        CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Groups_CreatedAt DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_Groups_CreatedByUser FOREIGN KEY (CreatedByUserID) REFERENCES dbo.Users(UserID)
    );
END;
GO

/* 2) Group membership */
IF OBJECT_ID('dbo.GroupMembers', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.GroupMembers (
        GroupID INT NOT NULL,
        UserID INT NOT NULL,
        Role NVARCHAR(20) NOT NULL CONSTRAINT DF_GroupMembers_Role DEFAULT 'member',
        JoinedAt DATETIME2 NOT NULL CONSTRAINT DF_GroupMembers_JoinedAt DEFAULT SYSUTCDATETIME(),
        CONSTRAINT PK_GroupMembers PRIMARY KEY (GroupID, UserID),
        CONSTRAINT FK_GroupMembers_Groups FOREIGN KEY (GroupID) REFERENCES dbo.Groups(GroupID) ON DELETE CASCADE,
        CONSTRAINT FK_GroupMembers_Users FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID),
        CONSTRAINT CK_GroupMembers_Role CHECK (Role IN ('admin','member'))
    );
END;
GO

/* 3) Posts inside groups */
IF OBJECT_ID('dbo.GroupPosts', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.GroupPosts (
        PostID INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        GroupID INT NOT NULL,
        UserID INT NOT NULL,
        Content NVARCHAR(MAX) NOT NULL,
        MediaURLs NVARCHAR(MAX) NULL,
        LikeCount INT NOT NULL CONSTRAINT DF_GroupPosts_LikeCount DEFAULT 0,
        CommentCount INT NOT NULL CONSTRAINT DF_GroupPosts_CommentCount DEFAULT 0,
        CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_GroupPosts_CreatedAt DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_GroupPosts_Groups FOREIGN KEY (GroupID) REFERENCES dbo.Groups(GroupID) ON DELETE CASCADE,
        CONSTRAINT FK_GroupPosts_Users FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID)
    );
END;
GO

/* 4) Likes for group posts */
IF OBJECT_ID('dbo.GroupPostLikes', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.GroupPostLikes (
        PostID INT NOT NULL,
        UserID INT NOT NULL,
        LikedAt DATETIME2 NOT NULL CONSTRAINT DF_GroupPostLikes_LikedAt DEFAULT SYSUTCDATETIME(),
        CONSTRAINT PK_GroupPostLikes PRIMARY KEY (PostID, UserID),
        CONSTRAINT FK_GroupPostLikes_GroupPosts FOREIGN KEY (PostID) REFERENCES dbo.GroupPosts(PostID) ON DELETE CASCADE,
        CONSTRAINT FK_GroupPostLikes_Users FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID)
    );
END;
GO

/* 5) Comments for group posts */
IF OBJECT_ID('dbo.GroupPostComments', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.GroupPostComments (
        CommentID INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        PostID INT NOT NULL,
        UserID INT NOT NULL,
        CommentText NVARCHAR(MAX) NOT NULL,
        CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_GroupPostComments_CreatedAt DEFAULT SYSUTCDATETIME(),
        ParentCommentID INT NULL,
        CONSTRAINT FK_GroupPostComments_GroupPosts FOREIGN KEY (PostID) REFERENCES dbo.GroupPosts(PostID) ON DELETE CASCADE,
        CONSTRAINT FK_GroupPostComments_Users FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID),
        CONSTRAINT FK_GroupPostComments_Parent FOREIGN KEY (ParentCommentID) REFERENCES dbo.GroupPostComments(CommentID)
    );
END;
GO

/* 6) Analytics events for conversion tracking, especially I want to go here */
IF OBJECT_ID('dbo.SocialAnalyticsEvents', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.SocialAnalyticsEvents (
        EventID BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        UserID INT NULL,
        EventName NVARCHAR(80) NOT NULL,
        DestinationName NVARCHAR(160) NULL,
        SourceType NVARCHAR(40) NULL,
        SourceID NVARCHAR(80) NULL,
        Metadata NVARCHAR(MAX) NULL,
        CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_SocialAnalyticsEvents_CreatedAt DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_SocialAnalyticsEvents_Users FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID)
    );
END;
GO

/* 7) Starter official groups */
MERGE dbo.Groups AS target
USING (VALUES
    ('Solo Travellers Pakistan', 'A safe community for solo travellers, buddy finding, routes and real trip advice.', NULL, 1),
    ('Honeymoon Travel', 'Romantic destinations, hotel suggestions and couple-trip planning.', NULL, 1),
    ('Backpackers Hub', 'Budget backpacking, hostels, routes and survival tips.', NULL, 1),
    ('Family Travel', 'Family-friendly destinations, child-safe activities and planning help.', NULL, 1),
    ('Budget Travel', 'Low-cost travel hacks, deal sharing and budget itineraries.', NULL, 1),
    ('Luxury Travel', 'Premium stays, resorts, fine dining and luxury experiences.', NULL, 1),
    ('Adventure Sports', 'Hiking, rafting, diving, skiing and high-energy travel.', NULL, 1),
    ('Food Tourism', 'Food trails, restaurants, street food and culinary travel.', NULL, 1),
    ('Photography Travellers', 'Photo spots, gear advice and visual storytelling.', NULL, 1),
    ('First-Time Travellers', 'Beginner-friendly help for first international or local trips.', NULL, 1)
) AS source (Name, Description, CoverImageURL, IsOfficial)
ON target.Name = source.Name
WHEN NOT MATCHED THEN
    INSERT (Name, Description, CoverImageURL, IsOfficial)
    VALUES (source.Name, source.Description, source.CoverImageURL, source.IsOfficial);
GO

/* 8) Indexes */
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Groups_Official_Members' AND object_id = OBJECT_ID('dbo.Groups'))
    CREATE INDEX IX_Groups_Official_Members ON dbo.Groups(IsOfficial DESC, MemberCount DESC, Name ASC);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_GroupPosts_Group_CreatedAt' AND object_id = OBJECT_ID('dbo.GroupPosts'))
    CREATE INDEX IX_GroupPosts_Group_CreatedAt ON dbo.GroupPosts(GroupID, CreatedAt DESC);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_GroupPosts_Feed' AND object_id = OBJECT_ID('dbo.GroupPosts'))
    CREATE INDEX IX_GroupPosts_Feed ON dbo.GroupPosts(CreatedAt DESC) INCLUDE (GroupID, UserID, LikeCount, CommentCount);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_SocialAnalyticsEvents_Event_CreatedAt' AND object_id = OBJECT_ID('dbo.SocialAnalyticsEvents'))
    CREATE INDEX IX_SocialAnalyticsEvents_Event_CreatedAt ON dbo.SocialAnalyticsEvents(EventName, CreatedAt DESC);
GO

/* 9) Keep Group.MemberCount synced */
CREATE OR ALTER TRIGGER dbo.trg_GroupMembers_UpdateMemberCount
ON dbo.GroupMembers
AFTER INSERT, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    ;WITH ChangedGroups AS (
        SELECT GroupID FROM inserted
        UNION
        SELECT GroupID FROM deleted
    )
    UPDATE g
    SET MemberCount = x.TotalMembers
    FROM dbo.Groups g
    INNER JOIN ChangedGroups c ON c.GroupID = g.GroupID
    CROSS APPLY (
        SELECT COUNT(*) AS TotalMembers
        FROM dbo.GroupMembers gm
        WHERE gm.GroupID = g.GroupID
    ) x;
END;
GO

/* 10) Keep GroupPost.LikeCount synced */
CREATE OR ALTER TRIGGER dbo.trg_GroupPostLikes_UpdateCount
ON dbo.GroupPostLikes
AFTER INSERT, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    ;WITH ChangedPosts AS (
        SELECT PostID FROM inserted
        UNION
        SELECT PostID FROM deleted
    )
    UPDATE gp
    SET LikeCount = x.TotalLikes
    FROM dbo.GroupPosts gp
    INNER JOIN ChangedPosts c ON c.PostID = gp.PostID
    CROSS APPLY (
        SELECT COUNT(*) AS TotalLikes
        FROM dbo.GroupPostLikes gpl
        WHERE gpl.PostID = gp.PostID
    ) x;
END;
GO

/* 11) Keep GroupPost.CommentCount synced */
CREATE OR ALTER TRIGGER dbo.trg_GroupPostComments_UpdateCount
ON dbo.GroupPostComments
AFTER INSERT, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    ;WITH ChangedPosts AS (
        SELECT PostID FROM inserted
        UNION
        SELECT PostID FROM deleted
    )
    UPDATE gp
    SET CommentCount = x.TotalComments
    FROM dbo.GroupPosts gp
    INNER JOIN ChangedPosts c ON c.PostID = gp.PostID
    CROSS APPLY (
        SELECT COUNT(*) AS TotalComments
        FROM dbo.GroupPostComments gpc
        WHERE gpc.PostID = gp.PostID
    ) x;
END;
GO

/* 12) Feed ranking procedure: recency 40 + engagement 30 + personalisation/filter 30 */
CREATE OR ALTER PROCEDURE dbo.sp_GetSocialFeed
    @UserID INT = NULL,
    @Filter NVARCHAR(40) = 'Trending',
    @Take INT = 20
AS
BEGIN
    SET NOCOUNT ON;

    ;WITH CreatorFeed AS (
        SELECT TOP (@Take)
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
            c.Name AS DestinationName,
            co.Name AS CountryName,
            u.DisplayName AS AuthorName,
            cr.Handle,
            cr.Niche AS Tag,
            cr.IsVerified,
            CAST((
                CASE WHEN DATEDIFF(HOUR, cp.CreatedAt, SYSUTCDATETIME()) <= 24 THEN 40 ELSE 10 END +
                CASE WHEN cp.ViewCount > 0 THEN ((cp.LikeCount + cp.CommentCount) * 30.0 / cp.ViewCount) ELSE 0 END +
                CASE WHEN @Filter IN ('Trending','Following','Recent') OR cr.Niche = LOWER(@Filter) THEN 30 ELSE 0 END
            ) AS DECIMAL(10,2)) AS RankScore
        FROM dbo.ContentPosts cp
        INNER JOIN dbo.CreatorProfiles cr ON cr.CreatorID = cp.CreatorID
        INNER JOIN dbo.Users u ON u.UserID = cp.CreatorID
        LEFT JOIN dbo.Cities c ON c.CityID = cp.DestinationCityID
        LEFT JOIN dbo.Countries co ON co.CountryID = c.CountryID
        WHERE cp.IsPublished = 1
          AND (@Filter IN ('Trending','Following','Recent') OR cr.Niche = LOWER(@Filter))
    ),
    GroupFeed AS (
        SELECT TOP (@Take)
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
            g.Name AS DestinationName,
            NULL AS CountryName,
            u.DisplayName AS AuthorName,
            g.Name AS Handle,
            'Community' AS Tag,
            g.IsOfficial AS IsVerified,
            CAST((
                CASE WHEN DATEDIFF(HOUR, gp.CreatedAt, SYSUTCDATETIME()) <= 24 THEN 40 ELSE 10 END +
                CASE WHEN (gp.LikeCount + gp.CommentCount) > 0 THEN 30 ELSE 0 END +
                CASE WHEN @Filter IN ('Trending','Following','Recent') THEN 30 ELSE 0 END
            ) AS DECIMAL(10,2)) AS RankScore
        FROM dbo.GroupPosts gp
        INNER JOIN dbo.Groups g ON g.GroupID = gp.GroupID
        INNER JOIN dbo.Users u ON u.UserID = gp.UserID
        WHERE @Filter IN ('Trending','Following','Recent')
    )
    SELECT TOP (@Take) *
    FROM (
        SELECT * FROM CreatorFeed
        UNION ALL
        SELECT * FROM GroupFeed
    ) x
    ORDER BY
        CASE WHEN @Filter = 'Recent' THEN DATEDIFF(SECOND, '20000101', CreatedAt) END DESC,
        CASE WHEN @Filter <> 'Recent' THEN RankScore END DESC,
        CreatedAt DESC;
END;
GO
