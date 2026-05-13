require('dotenv').config();
const { poolPromise, sql } = require('./db');

async function setupVloggerSchema() {
  try {
    const pool = await poolPromise;
    console.log('Connected to SQL Server');

    // 1. CreatorProfiles
    await pool.request().query(`
      IF OBJECT_ID('dbo.CreatorProfiles', 'U') IS NULL
      BEGIN
          CREATE TABLE dbo.CreatorProfiles (
              CreatorID INT NOT NULL PRIMARY KEY,
              Handle NVARCHAR(50) NOT NULL UNIQUE,
              Niche NVARCHAR(50) NULL,
              SocialInstagram NVARCHAR(255) NULL,
              SocialYouTube NVARCHAR(255) NULL,
              Bio NVARCHAR(MAX) NULL,
              FollowerCount INT NOT NULL DEFAULT 0,
              TotalViews BIGINT NOT NULL DEFAULT 0,
              IsVerified BIT NOT NULL DEFAULT 0,
              JoinedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
              CONSTRAINT FK_CreatorProfiles_Users FOREIGN KEY (CreatorID) REFERENCES dbo.Users(UserID)
          );
      END
    `);
    console.log('CreatorProfiles table checked/created');

    // 2. ContentPosts
    await pool.request().query(`
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
              ViewCount INT NOT NULL DEFAULT 0,
              LikeCount INT NOT NULL DEFAULT 0,
              CommentCount INT NOT NULL DEFAULT 0,
              IsPublished BIT NOT NULL DEFAULT 1,
              CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
              CONSTRAINT FK_ContentPosts_CreatorProfiles FOREIGN KEY (CreatorID) REFERENCES dbo.CreatorProfiles(CreatorID),
              CONSTRAINT FK_ContentPosts_Cities FOREIGN KEY (DestinationCityID) REFERENCES dbo.Cities(CityID)
          );
      END
    `);
    console.log('ContentPosts table checked/created');

    process.exit(0);
  } catch (err) {
    console.error('Schema setup failed:', err.message);
    process.exit(1);
  }
}

setupVloggerSchema();
