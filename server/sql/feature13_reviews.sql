USE TB;
GO

-- ========================================================
-- TravelBuddy — Feature 13: Ratings & Reviews Trust System
-- ========================================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Reviews')
BEGIN
  CREATE TABLE Reviews (
    ReviewID     INT IDENTITY(1,1) PRIMARY KEY,
    ReviewerID   INT NOT NULL,
    EntityType   NVARCHAR(30) NOT NULL CHECK (EntityType IN ('hotel','restaurant','attraction','buddy','city')),
    EntityID     INT NOT NULL,
    TripID       INT NULL,
    Rating       TINYINT NOT NULL CHECK (Rating BETWEEN 1 AND 5),
    Title        NVARCHAR(200),
    ReviewText   NVARCHAR(MAX),
    PhotoURLs    NVARCHAR(MAX),
    IsVerified   BIT DEFAULT 0,
    HelpfulCount INT DEFAULT 0,
    CreatedAt    DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_Reviews_User FOREIGN KEY (ReviewerID) REFERENCES Users(UserID),
    CONSTRAINT FK_Reviews_Trip FOREIGN KEY (TripID) REFERENCES Trips(TripID)
  );
END;
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ReviewHelpful')
BEGIN
  CREATE TABLE ReviewHelpful (
    ReviewID INT NOT NULL,
    UserID   INT NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    PRIMARY KEY (ReviewID, UserID),
    CONSTRAINT FK_RH_Review FOREIGN KEY (ReviewID) REFERENCES Reviews(ReviewID),
    CONSTRAINT FK_RH_User FOREIGN KEY (UserID) REFERENCES Users(UserID)
  );
END;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Reviews_Entity')
  CREATE INDEX IX_Reviews_Entity ON Reviews(EntityType, EntityID, CreatedAt DESC);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Reviews_Reviewer')
  CREATE INDEX IX_Reviews_Reviewer ON Reviews(ReviewerID, CreatedAt DESC);
GO
