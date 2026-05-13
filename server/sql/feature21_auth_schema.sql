-- =====================================================
-- Feature 21: Authentication, Security & User Management
-- Schema additions for production auth system
-- =====================================================

-- 1. Add missing columns to Users table (safe: skip if exist)
IF COL_LENGTH('Users', 'AvatarURL') IS NULL
  ALTER TABLE Users ADD AvatarURL NVARCHAR(500) DEFAULT NULL;
GO

IF COL_LENGTH('Users', 'CoverPhotoURL') IS NULL
  ALTER TABLE Users ADD CoverPhotoURL NVARCHAR(500) DEFAULT NULL;
GO

IF COL_LENGTH('Users', 'HomeCity') IS NULL
  ALTER TABLE Users ADD HomeCity NVARCHAR(100) DEFAULT NULL;
GO

IF COL_LENGTH('Users', 'IsEmailVerified') IS NULL
  ALTER TABLE Users ADD IsEmailVerified BIT DEFAULT 0;
GO

IF COL_LENGTH('Users', 'GoogleID') IS NULL
  ALTER TABLE Users ADD GoogleID NVARCHAR(100) DEFAULT NULL;
GO

IF COL_LENGTH('Users', 'LastActiveAt') IS NULL
  ALTER TABLE Users ADD LastActiveAt DATETIME DEFAULT GETDATE();
GO

-- 2. Make PasswordHash nullable (for Google OAuth users who have no password)
IF EXISTS (
  SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'PasswordHash' AND IS_NULLABLE = 'NO'
)
BEGIN
  ALTER TABLE Users ALTER COLUMN PasswordHash NVARCHAR(255) NULL;
END;
GO

-- 3. Create RefreshTokens table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'RefreshTokens')
BEGIN
  CREATE TABLE RefreshTokens (
    TokenID    INT PRIMARY KEY IDENTITY(1,1),
    UserID     INT NOT NULL FOREIGN KEY REFERENCES Users(UserID) ON DELETE CASCADE,
    TokenHash  NVARCHAR(200) NOT NULL,
    ExpiresAt  DATETIME NOT NULL,
    CreatedAt  DATETIME DEFAULT GETDATE(),
    IsRevoked  BIT DEFAULT 0
  );
END;
GO

-- 4. Create EmailVerifications table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'EmailVerifications')
BEGIN
  CREATE TABLE EmailVerifications (
    VerifID    INT PRIMARY KEY IDENTITY(1,1),
    UserID     INT NOT NULL FOREIGN KEY REFERENCES Users(UserID) ON DELETE CASCADE,
    Token      NVARCHAR(200) NOT NULL,
    ExpiresAt  DATETIME NOT NULL,
    UsedAt     DATETIME DEFAULT NULL
  );
END;
GO

-- 5. Create PasswordResets table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PasswordResets')
BEGIN
  CREATE TABLE PasswordResets (
    ResetID    INT PRIMARY KEY IDENTITY(1,1),
    UserID     INT NOT NULL FOREIGN KEY REFERENCES Users(UserID) ON DELETE CASCADE,
    Token      NVARCHAR(200) NOT NULL,
    ExpiresAt  DATETIME NOT NULL,
    UsedAt     DATETIME DEFAULT NULL
  );
END;
GO

-- 6. Indexes for performance
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Users_Email_F21')
  CREATE INDEX IX_Users_Email_F21 ON Users(Email);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_RefreshTokens_UserID')
  CREATE INDEX IX_RefreshTokens_UserID ON RefreshTokens(UserID);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_EmailVerifications_Token')
  CREATE INDEX IX_EmailVerifications_Token ON EmailVerifications(Token);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_PasswordResets_Token')
  CREATE INDEX IX_PasswordResets_Token ON PasswordResets(Token);
GO

-- 7. Mark all existing users as email-verified (they were seeded, not registered)
UPDATE Users SET IsEmailVerified = 1 WHERE IsEmailVerified = 0 OR IsEmailVerified IS NULL;
GO

PRINT 'Feature 21 schema applied successfully.';
