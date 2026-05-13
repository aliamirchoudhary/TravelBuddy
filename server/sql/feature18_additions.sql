-- Feature 18 & 19 Support: Add TrustScore and ReviewCount to Cities
IF COL_LENGTH('Cities', 'TrustScore') IS NULL
BEGIN
    ALTER TABLE Cities ADD TrustScore DECIMAL(4,2) DEFAULT 0;
END
GO

IF COL_LENGTH('Cities', 'ReviewCount') IS NULL
BEGIN
    ALTER TABLE Cities ADD ReviewCount INT DEFAULT 0;
END
GO
