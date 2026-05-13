/*
  TravelBuddy Feature 12 — Vlogger Hub & Content Creator Ecosystem
  Purpose: Schema-only patch for Azure SQL Server integration.

  Do not run this locally unless your base TravelBuddy schema already exists.
  Expected existing tables: Users, Trips, Cities.
*/

/* 1) Creator profile attached 1:1 to Users */
IF OBJECT_ID('dbo.CreatorProfiles', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.CreatorProfiles (
        CreatorID INT NOT NULL PRIMARY KEY,
        Handle NVARCHAR(50) NOT NULL UNIQUE,
        Niche NVARCHAR(50) NULL,
        SocialInstagram NVARCHAR(255) NULL,
        SocialYouTube NVARCHAR(255) NULL,
        Bio NVARCHAR(MAX) NULL,
        FollowerCount INT NOT NULL CONSTRAINT DF_CreatorProfiles_FollowerCount DEFAULT 0,
        TotalViews BIGINT NOT NULL CONSTRAINT DF_CreatorProfiles_TotalViews DEFAULT 0,
        IsVerified BIT NOT NULL CONSTRAINT DF_CreatorProfiles_IsVerified DEFAULT 0,
        JoinedAt DATETIME2 NOT NULL CONSTRAINT DF_CreatorProfiles_JoinedAt DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_CreatorProfiles_Users FOREIGN KEY (CreatorID) REFERENCES dbo.Users(UserID),
        CONSTRAINT CK_CreatorProfiles_Niche CHECK (
            Niche IS NULL OR Niche IN ('adventure','food','budget','luxury','solo','family','photography','backpacking')
        )
    );
END;
GO

/* 2) Creator content posts */
IF OBJECT_ID('dbo.ContentPosts', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ContentPosts (
        PostID INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CreatorID INT NOT NULL,
        TripID INT NULL,
        Title NVARCHAR(200) NOT NULL,
        Description NVARCHAR(MAX) NULL,
        MediaType NVARCHAR(20) NOT NULL,
        MediaURL NVARCHAR(MAX) NOT NULL,
        ThumbnailURL NVARCHAR(MAX) NULL,
        DestinationCityID INT NULL,
        ViewCount INT NOT NULL CONSTRAINT DF_ContentPosts_ViewCount DEFAULT 0,
        LikeCount INT NOT NULL CONSTRAINT DF_ContentPosts_LikeCount DEFAULT 0,
        CommentCount INT NOT NULL CONSTRAINT DF_ContentPosts_CommentCount DEFAULT 0,
        IsPublished BIT NOT NULL CONSTRAINT DF_ContentPosts_IsPublished DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_ContentPosts_CreatedAt DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_ContentPosts_CreatorProfiles FOREIGN KEY (CreatorID) REFERENCES dbo.CreatorProfiles(CreatorID),
        CONSTRAINT FK_ContentPosts_Trips FOREIGN KEY (TripID) REFERENCES dbo.Trips(TripID),
        CONSTRAINT FK_ContentPosts_Cities FOREIGN KEY (DestinationCityID) REFERENCES dbo.Cities(CityID),
        CONSTRAINT CK_ContentPosts_MediaType CHECK (MediaType IN ('video','photo','photoset','travellog'))
    );
END;
GO

/* 3) Likes */
IF OBJECT_ID('dbo.ContentLikes', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ContentLikes (
        PostID INT NOT NULL,
        UserID INT NOT NULL,
        LikedAt DATETIME2 NOT NULL CONSTRAINT DF_ContentLikes_LikedAt DEFAULT SYSUTCDATETIME(),
        CONSTRAINT PK_ContentLikes PRIMARY KEY (PostID, UserID),
        CONSTRAINT FK_ContentLikes_ContentPosts FOREIGN KEY (PostID) REFERENCES dbo.ContentPosts(PostID) ON DELETE CASCADE,
        CONSTRAINT FK_ContentLikes_Users FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID)
    );
END;
GO

/* 4) Comments with threaded replies */
IF OBJECT_ID('dbo.ContentComments', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ContentComments (
        CommentID INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        PostID INT NOT NULL,
        UserID INT NOT NULL,
        CommentText NVARCHAR(MAX) NOT NULL,
        CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_ContentComments_CreatedAt DEFAULT SYSUTCDATETIME(),
        ParentCommentID INT NULL,
        CONSTRAINT FK_ContentComments_ContentPosts FOREIGN KEY (PostID) REFERENCES dbo.ContentPosts(PostID) ON DELETE CASCADE,
        CONSTRAINT FK_ContentComments_Users FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID),
        CONSTRAINT FK_ContentComments_Parent FOREIGN KEY (ParentCommentID) REFERENCES dbo.ContentComments(CommentID)
    );
END;
GO

/* 5) Phase-1 marketplace: digital products only, manual/request-payment model */
IF OBJECT_ID('dbo.CreatorProducts', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.CreatorProducts (
        ProductID INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CreatorID INT NOT NULL,
        Title NVARCHAR(160) NOT NULL,
        Description NVARCHAR(MAX) NULL,
        ProductType NVARCHAR(30) NOT NULL,
        PriceAmount DECIMAL(10,2) NOT NULL CONSTRAINT DF_CreatorProducts_Price DEFAULT 0,
        CurrencyCode CHAR(3) NOT NULL CONSTRAINT DF_CreatorProducts_Currency DEFAULT 'PKR',
        FileURL NVARCHAR(MAX) NULL,
        CoverImageURL NVARCHAR(MAX) NULL,
        IsActive BIT NOT NULL CONSTRAINT DF_CreatorProducts_IsActive DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_CreatorProducts_CreatedAt DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_CreatorProducts_CreatorProfiles FOREIGN KEY (CreatorID) REFERENCES dbo.CreatorProfiles(CreatorID),
        CONSTRAINT CK_CreatorProducts_ProductType CHECK (ProductType IN ('guide','packing_list','budget_guide','itinerary_template'))
    );
END;
GO

/* 6) Collaboration requests between creators */
IF OBJECT_ID('dbo.CreatorCollabRequests', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.CreatorCollabRequests (
        CollabID INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        FromCreatorID INT NOT NULL,
        ToCreatorID INT NOT NULL,
        DestinationCityID INT NULL,
        Message NVARCHAR(MAX) NULL,
        Status NVARCHAR(20) NOT NULL CONSTRAINT DF_CreatorCollab_Status DEFAULT 'pending',
        CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_CreatorCollab_CreatedAt DEFAULT SYSUTCDATETIME(),
        RespondedAt DATETIME2 NULL,
        CONSTRAINT FK_CreatorCollab_From FOREIGN KEY (FromCreatorID) REFERENCES dbo.CreatorProfiles(CreatorID),
        CONSTRAINT FK_CreatorCollab_To FOREIGN KEY (ToCreatorID) REFERENCES dbo.CreatorProfiles(CreatorID),
        CONSTRAINT FK_CreatorCollab_City FOREIGN KEY (DestinationCityID) REFERENCES dbo.Cities(CityID),
        CONSTRAINT CK_CreatorCollab_Status CHECK (Status IN ('pending','accepted','declined','cancelled')),
        CONSTRAINT CK_CreatorCollab_NotSelf CHECK (FromCreatorID <> ToCreatorID)
    );
END;
GO

/* Indexes */
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ContentPosts_Creator_CreatedAt' AND object_id = OBJECT_ID('dbo.ContentPosts'))
    CREATE INDEX IX_ContentPosts_Creator_CreatedAt ON dbo.ContentPosts(CreatorID, CreatedAt DESC);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ContentPosts_City_CreatedAt' AND object_id = OBJECT_ID('dbo.ContentPosts'))
    CREATE INDEX IX_ContentPosts_City_CreatedAt ON dbo.ContentPosts(DestinationCityID, CreatedAt DESC) WHERE DestinationCityID IS NOT NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ContentPosts_PublishedFeed' AND object_id = OBJECT_ID('dbo.ContentPosts'))
    CREATE INDEX IX_ContentPosts_PublishedFeed ON dbo.ContentPosts(IsPublished, CreatedAt DESC) INCLUDE (CreatorID, ViewCount, LikeCount, CommentCount);
GO

/* Trigger: keep LikeCount synced */
CREATE OR ALTER TRIGGER dbo.trg_ContentLikes_UpdateCount
ON dbo.ContentLikes
AFTER INSERT, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    ;WITH ChangedPosts AS (
        SELECT PostID FROM inserted
        UNION
        SELECT PostID FROM deleted
    )
    UPDATE cp
    SET LikeCount = x.TotalLikes
    FROM dbo.ContentPosts cp
    INNER JOIN ChangedPosts c ON c.PostID = cp.PostID
    CROSS APPLY (
        SELECT COUNT(*) AS TotalLikes
        FROM dbo.ContentLikes cl
        WHERE cl.PostID = cp.PostID
    ) x;
END;
GO

/* Trigger: keep CommentCount synced */
CREATE OR ALTER TRIGGER dbo.trg_ContentComments_UpdateCount
ON dbo.ContentComments
AFTER INSERT, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    ;WITH ChangedPosts AS (
        SELECT PostID FROM inserted
        UNION
        SELECT PostID FROM deleted
    )
    UPDATE cp
    SET CommentCount = x.TotalComments
    FROM dbo.ContentPosts cp
    INNER JOIN ChangedPosts c ON c.PostID = cp.PostID
    CROSS APPLY (
        SELECT COUNT(*) AS TotalComments
        FROM dbo.ContentComments cc
        WHERE cc.PostID = cp.PostID
    ) x;
END;
GO

/* Procedure: basic creator analytics */
CREATE OR ALTER PROCEDURE dbo.sp_GetCreatorAnalytics
    @CreatorID INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        COUNT(*) AS TotalPosts,
        ISNULL(SUM(ViewCount), 0) AS TotalViews,
        ISNULL(SUM(LikeCount), 0) AS TotalLikes,
        ISNULL(SUM(CommentCount), 0) AS TotalComments
    FROM dbo.ContentPosts
    WHERE CreatorID = @CreatorID;

    SELECT TOP 5
        PostID,
        Title,
        MediaType,
        ViewCount,
        LikeCount,
        CommentCount,
        CreatedAt
    FROM dbo.ContentPosts
    WHERE CreatorID = @CreatorID
    ORDER BY ViewCount DESC, LikeCount DESC, CreatedAt DESC;
END;
GO
