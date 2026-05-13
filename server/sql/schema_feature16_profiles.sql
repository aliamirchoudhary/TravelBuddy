-- ========================================================
-- TravelBuddy — Feature 16: User Profiles & Travel Timeline
-- Schema additions
-- ========================================================

-- 1) Add missing columns to Users table
IF COL_LENGTH('Users', 'AvatarURL') IS NULL
  ALTER TABLE Users ADD AvatarURL NVARCHAR(500) NULL;
GO

IF COL_LENGTH('Users', 'CoverPhotoURL') IS NULL
  ALTER TABLE Users ADD CoverPhotoURL NVARCHAR(500) NULL;
GO

IF COL_LENGTH('Users', 'HomeCity') IS NULL
  ALTER TABLE Users ADD HomeCity NVARCHAR(100) NULL;
GO

IF COL_LENGTH('Users', 'LastActiveAt') IS NULL
  ALTER TABLE Users ADD LastActiveAt DATETIME NULL;
GO

IF COL_LENGTH('Users', 'Bio') IS NULL
  ALTER TABLE Users ADD Bio NVARCHAR(500) NULL;
GO

-- 2) Badges lookup table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Badges')
BEGIN
  CREATE TABLE Badges (
    BadgeID     INT IDENTITY(1,1) PRIMARY KEY,
    Name        NVARCHAR(100) NOT NULL,
    Description NVARCHAR(300),
    IconURL     NVARCHAR(500),
    [Trigger]   NVARCHAR(50)  -- 'trip_count','country_count','review_count','buddy_count','challenge'
  );
END;
GO

-- 3) User-Badge junction
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'UserBadges')
BEGIN
  CREATE TABLE UserBadges (
    UserID    INT NOT NULL REFERENCES Users(UserID),
    BadgeID   INT NOT NULL REFERENCES Badges(BadgeID),
    EarnedAt  DATETIME DEFAULT GETDATE(),
    CONSTRAINT PK_UserBadges PRIMARY KEY (UserID, BadgeID)
  );
END;
GO

-- 4) Privacy settings per user
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'UserPrivacySettings')
BEGIN
  CREATE TABLE UserPrivacySettings (
    UserID              INT PRIMARY KEY REFERENCES Users(UserID),
    ShowTimeline        BIT DEFAULT 1,
    ShowExpenseHistory  BIT DEFAULT 0,
    ShowReviews         BIT DEFAULT 1,
    UpdatedAt           DATETIME DEFAULT GETDATE()
  );
END;
GO

-- 5) Seed default badges
IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Badges')
   AND NOT EXISTS (SELECT 1 FROM Badges)
BEGIN
  INSERT INTO Badges (Name, Description, IconURL, [Trigger])
  VALUES
    ('First Steps',      'Completed your first trip',                           NULL, 'trip_count'),
    ('Globe Trotter',    'Visited 5 or more countries',                         NULL, 'country_count'),
    ('Trusted Member',   'Earned a trust score of 95+',                         NULL, 'challenge'),
    ('Review Master',    'Written 10 or more reviews',                          NULL, 'review_count'),
    ('Social Butterfly', 'Made 5 or more buddy connections',                    NULL, 'buddy_count'),
    ('Explorer',         'Completed 5 or more trips',                           NULL, 'trip_count');
END;
GO

-- 6) Indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_UserBadges_User')
  CREATE INDEX IX_UserBadges_User ON UserBadges(UserID, EarnedAt DESC);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_UserPrivacy_User')
  CREATE INDEX IX_UserPrivacy_User ON UserPrivacySettings(UserID);
GO
