use [travel-buddy-db];
/*
  TravelBuddy Feature 15 Live Messaging Fix
  Run this ONCE on Azure SQL before testing real chat.

  This version is safe to run even if tables already exist.
  It also fixes the common error:
  "Invalid column name 'JoinedAt'"
*/

IF OBJECT_ID('dbo.Conversations', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Conversations (
        ConvID INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        Type NVARCHAR(20) NOT NULL CONSTRAINT DF_Conversations_Type DEFAULT 'direct',
        TripID INT NULL,
        CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Conversations_CreatedAt DEFAULT SYSUTCDATETIME(),
        CONSTRAINT CK_Conversations_Type CHECK (Type IN ('direct', 'group'))
    );
END;
GO

IF COL_LENGTH('dbo.Conversations', 'Type') IS NULL
BEGIN
    ALTER TABLE dbo.Conversations ADD Type NVARCHAR(20) NOT NULL CONSTRAINT DF_Conversations_Type_Added DEFAULT 'direct';
END;
GO

IF COL_LENGTH('dbo.Conversations', 'TripID') IS NULL
BEGIN
    ALTER TABLE dbo.Conversations ADD TripID INT NULL;
END;
GO

IF COL_LENGTH('dbo.Conversations', 'CreatedAt') IS NULL
BEGIN
    ALTER TABLE dbo.Conversations ADD CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Conversations_CreatedAt_Added DEFAULT SYSUTCDATETIME();
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

IF COL_LENGTH('dbo.ConversationParticipants', 'JoinedAt') IS NULL
BEGIN
    ALTER TABLE dbo.ConversationParticipants ADD JoinedAt DATETIME2 NOT NULL CONSTRAINT DF_ConversationParticipants_JoinedAt_Added DEFAULT SYSUTCDATETIME();
END;
GO

IF COL_LENGTH('dbo.ConversationParticipants', 'LastReadAt') IS NULL
BEGIN
    ALTER TABLE dbo.ConversationParticipants ADD LastReadAt DATETIME2 NULL;
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
        CONSTRAINT CK_Messages_MessageType CHECK (MessageType IN ('text', 'image', 'expense', 'system'))
    );
END;
GO

IF COL_LENGTH('dbo.Messages', 'MediaURL') IS NULL
BEGIN
    ALTER TABLE dbo.Messages ADD MediaURL NVARCHAR(500) NULL;
END;
GO

IF COL_LENGTH('dbo.Messages', 'MessageType') IS NULL
BEGIN
    ALTER TABLE dbo.Messages ADD MessageType NVARCHAR(20) NOT NULL CONSTRAINT DF_Messages_MessageType_Added DEFAULT 'text';
END;
GO

IF COL_LENGTH('dbo.Messages', 'SentAt') IS NULL
BEGIN
    ALTER TABLE dbo.Messages ADD SentAt DATETIME2 NOT NULL CONSTRAINT DF_Messages_SentAt_Added DEFAULT SYSUTCDATETIME();
END;
GO

IF COL_LENGTH('dbo.Messages', 'IsDeleted') IS NULL
BEGIN
    ALTER TABLE dbo.Messages ADD IsDeleted BIT NOT NULL CONSTRAINT DF_Messages_IsDeleted_Added DEFAULT 0;
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Messages_ConvID_SentAt' AND object_id = OBJECT_ID('dbo.Messages'))
BEGIN
    CREATE INDEX IX_Messages_ConvID_SentAt ON dbo.Messages (ConvID, SentAt);
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ConversationParticipants_UserID' AND object_id = OBJECT_ID('dbo.ConversationParticipants'))
BEGIN
    CREATE INDEX IX_ConversationParticipants_UserID ON dbo.ConversationParticipants (UserID);
END;
GO

PRINT 'Feature 15 live messaging schema/fix applied successfully.';
GO

