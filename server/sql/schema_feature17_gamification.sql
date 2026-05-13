-- ========================================================
-- TravelBuddy — Feature 17: Gamification & Badges
-- ========================================================

-- Ensure Badges table exists
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Badges')
BEGIN
  CREATE TABLE Badges (
    BadgeID     INT IDENTITY(1,1) PRIMARY KEY,
    Name        NVARCHAR(100) NOT NULL,
    Description NVARCHAR(300),
    IconURL     NVARCHAR(500),
    [Trigger]   NVARCHAR(50)
  );
END;
GO

-- Ensure UserBadges table exists
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

-- Add UNIQUE constraint to UserBadges to strictly prevent duplicates
IF NOT EXISTS (SELECT * FROM sys.objects WHERE type = 'UQ' AND name = 'UQ_UserBadge')
BEGIN
  ALTER TABLE UserBadges ADD CONSTRAINT UQ_UserBadge UNIQUE (UserID, BadgeID);
END;
GO

-- Truncate existing Badges to apply the new 12 exact badges
-- (Requires clearing UserBadges first if there are FK constraints, but we only delete Badges if we need to seed)
IF EXISTS (SELECT 1 FROM Badges)
BEGIN
  -- We'll just delete the old ones safely
  DELETE FROM UserBadges;
  DBCC CHECKIDENT ('Badges', RESEED, 0);
  DELETE FROM Badges;
END;
GO

-- Seed the 12 badges
INSERT INTO Badges (Name, Description, IconURL, [Trigger]) VALUES
('First Steps',      'Complete your very first trip on TravelBuddy.',              '/badges/first-steps.png',     'trip_count'),
('Explorer',         'Complete 5 trips.',                                           '/badges/explorer.png',        'trip_count'),
('World Traveller',  'Complete 10 trips.',                                          '/badges/world-traveller.png', 'trip_count'),
('Globe Trotter',    'Visit 5 different countries.',                                '/badges/globe-trotter.png',   'country_count'),
('World Explorer',   'Visit 15 different countries.',                               '/badges/world-explorer.png',  'country_count'),
('Trusted Traveller','Earn a Trust Score of 4.5 or higher.',                        '/badges/trusted.png',         'trust_score'),
('Social Butterfly', 'Make 5 buddy connections.',                                   '/badges/social-butterfly.png','buddy_count'),
('Critic',           'Write 10 reviews on TravelBuddy.',                            '/badges/critic.png',          'review_count'),
('Budget Master',    'Log shared expenses totalling over PKR 50,000.',              '/badges/budget-master.png',   'expense_total'),
('Content King',     'Earn 1,000 views on a single post as a creator.',             '/badges/content-king.png',    'post_views'),
('Adventurer',       'Add an adventure-type attraction to 3 or more trips.',        '/badges/adventurer.png',      'adventure_trips'),
('Group Leader',     'Create a group with 50 or more members.',                     '/badges/group-leader.png',    'group_members');
GO
