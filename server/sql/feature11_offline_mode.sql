/*
  Feature 11: Offline Mode Schema
  Purpose:
  - Store generated offline trip bundles for Azure/final DB integration.
  - Track when a user downloads/syncs a bundle.
  - The frontend still stores the actual downloaded bundle in IndexedDB.

  Note:
  - Do not run this locally if your current task is only schema preparation.
  - Run later in Azure SQL after confirming table names for Users and Trips.
*/

IF OBJECT_ID('dbo.OfflineTripBundles', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.OfflineTripBundles (
    BundleID INT IDENTITY(1,1) PRIMARY KEY,
    TripID INT NOT NULL,
    UserID INT NULL,
    BundleJSON NVARCHAR(MAX) NOT NULL,
    StaticMapURL NVARCHAR(1000) NULL,
    BundleVersion INT NOT NULL DEFAULT 1,
    GeneratedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    ExpiresAt DATETIME2 NULL,
    LastDownloadedAt DATETIME2 NULL,
    IsActive BIT NOT NULL DEFAULT 1,

    CONSTRAINT CK_OfflineTripBundles_BundleJSON_IsJson
      CHECK (ISJSON(BundleJSON) = 1)
  );
END;
GO

IF OBJECT_ID('dbo.OfflineBundleSyncLogs', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.OfflineBundleSyncLogs (
    SyncLogID INT IDENTITY(1,1) PRIMARY KEY,
    BundleID INT NULL,
    TripID INT NOT NULL,
    UserID INT NULL,
    ActionType NVARCHAR(30) NOT NULL,
    DeviceInfo NVARCHAR(500) NULL,
    SyncedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT CK_OfflineBundleSyncLogs_ActionType
      CHECK (ActionType IN ('downloaded', 'refreshed', 'opened_offline', 'deleted'))
  );
END;
GO

IF NOT EXISTS (
  SELECT 1 FROM sys.indexes
  WHERE name = 'IX_OfflineTripBundles_TripID_UserID_Active'
    AND object_id = OBJECT_ID('dbo.OfflineTripBundles')
)
BEGIN
  CREATE INDEX IX_OfflineTripBundles_TripID_UserID_Active
  ON dbo.OfflineTripBundles (TripID, UserID, IsActive)
  INCLUDE (GeneratedAt, LastDownloadedAt, BundleVersion);
END;
GO

IF NOT EXISTS (
  SELECT 1 FROM sys.indexes
  WHERE name = 'IX_OfflineBundleSyncLogs_TripID_UserID'
    AND object_id = OBJECT_ID('dbo.OfflineBundleSyncLogs')
)
BEGIN
  CREATE INDEX IX_OfflineBundleSyncLogs_TripID_UserID
  ON dbo.OfflineBundleSyncLogs (TripID, UserID, SyncedAt DESC);
END;
GO

/*
Optional foreign keys for final integration.
Uncomment after confirming your real table names and primary key names.

ALTER TABLE dbo.OfflineTripBundles
ADD CONSTRAINT FK_OfflineTripBundles_Trips
FOREIGN KEY (TripID) REFERENCES dbo.Trips(TripID);

ALTER TABLE dbo.OfflineTripBundles
ADD CONSTRAINT FK_OfflineTripBundles_Users
FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID);

ALTER TABLE dbo.OfflineBundleSyncLogs
ADD CONSTRAINT FK_OfflineBundleSyncLogs_Bundles
FOREIGN KEY (BundleID) REFERENCES dbo.OfflineTripBundles(BundleID);
*/
