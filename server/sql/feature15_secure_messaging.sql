/*
  TravelBuddy Feature 15 — Secure Messaging & Group Chat
  Purpose: Schema-only patch for Azure SQL Server integration.

  Do not run this locally unless your base TravelBuddy schema already exists.
  Expected existing tables: Users. Optional existing table: Trips.
*/

IF OBJECT_ID('dbo.Conversations', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Conversations (
        ConvID INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        Type NVARCHAR(20) NOT NULL,
        TripID INT NULL,
        CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Conversations_CreatedAt DEFAULT SYSUTCDATETIME(),
        CONSTRAINT CK_Conversations_Type CHECK (Type IN ('direct', 'group')),
        CONSTRAINT FK_Conversations_Trip FOREIGN KEY (TripID) REFERENCES dbo.Trips(TripID)
    );
END;
GO

IF OBJECT_ID('dbo.ConversationParticipants', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ConversationParticipants (
        ConvID INT NOT NULL,
        UserID INT NOT NULL,
        JoinedAt DATETIME2 NOT NULL CONSTRAINT DF_ConversationParticipants_JoinedAt DEFAULT SYSUTCDATETIME(),
        LastReadAt DATETIME2 NULL,
        CONSTRAINT PK_ConversationParticipants PRIMARY KEY (ConvID, UserID),
        CONSTRAINT FK_ConversationParticipants_Conversation FOREIGN KEY (ConvID) REFERENCES dbo.Conversations(ConvID) ON DELETE CASCADE,
        CONSTRAINT FK_ConversationParticipants_User FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID)
    );
END;
GO

IF OBJECT_ID('dbo.Messages', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Messages (
        MessageID INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        ConvID INT NOT NULL,
        SenderID INT NOT NULL,
        MessageText NVARCHAR(MAX) NULL,
        MediaURL NVARCHAR(500) NULL,
        MessageType NVARCHAR(20) NOT NULL CONSTRAINT DF_Messages_MessageType DEFAULT 'text',
        SentAt DATETIME2 NOT NULL CONSTRAINT DF_Messages_SentAt DEFAULT SYSUTCDATETIME(),
        IsDeleted BIT NOT NULL CONSTRAINT DF_Messages_IsDeleted DEFAULT 0,
        CONSTRAINT FK_Messages_Conversation FOREIGN KEY (ConvID) REFERENCES dbo.Conversations(ConvID) ON DELETE CASCADE,
        CONSTRAINT FK_Messages_Sender FOREIGN KEY (SenderID) REFERENCES dbo.Users(UserID),
        CONSTRAINT CK_Messages_MessageType CHECK (MessageType IN ('text', 'image', 'expense', 'system')),
        CONSTRAINT CK_Messages_HasContent CHECK (MessageText IS NOT NULL OR MediaURL IS NOT NULL)
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Messages_ConvID_SentAt' AND object_id = OBJECT_ID('dbo.Messages'))
BEGIN
    CREATE INDEX IX_Messages_ConvID_SentAt ON dbo.Messages (ConvID, SentAt DESC);
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ConversationParticipants_UserID' AND object_id = OBJECT_ID('dbo.ConversationParticipants'))
BEGIN
    CREATE INDEX IX_ConversationParticipants_UserID ON dbo.ConversationParticipants (UserID);
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Conversations_TripID' AND object_id = OBJECT_ID('dbo.Conversations'))
BEGIN
    CREATE INDEX IX_Conversations_TripID ON dbo.Conversations (TripID);
END;
GO

CREATE OR ALTER PROCEDURE dbo.CreateDirectConversationForBuddyMatch
    @UserAID INT,
    @UserBID INT,
    @TripID INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ConvID INT;

    INSERT INTO dbo.Conversations (Type, TripID)
    VALUES ('direct', @TripID);

    SET @ConvID = SCOPE_IDENTITY();

    INSERT INTO dbo.ConversationParticipants (ConvID, UserID)
    VALUES (@ConvID, @UserAID), (@ConvID, @UserBID);

    SELECT @ConvID AS ConvID;
END;
GO
