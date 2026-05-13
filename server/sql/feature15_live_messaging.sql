/* TravelBuddy Feature 15 - Live Messaging Schema */

IF OBJECT_ID('dbo.Conversations', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.Conversations (
    ConvID INT IDENTITY(1,1) PRIMARY KEY,
    Type NVARCHAR(20) NOT NULL DEFAULT 'direct',
    TripID INT NULL,
    Title NVARCHAR(150) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_Conversations_Type CHECK (Type IN ('direct', 'group'))
  );
END;
GO

IF OBJECT_ID('dbo.ConversationParticipants', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.ConversationParticipants (
    ConvID INT NOT NULL,
    UserID INT NOT NULL,
    JoinedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    LastReadAt DATETIME2 NULL,
    CONSTRAINT PK_ConversationParticipants PRIMARY KEY (ConvID, UserID),
    CONSTRAINT FK_ConversationParticipants_Conversations FOREIGN KEY (ConvID) REFERENCES dbo.Conversations(ConvID) ON DELETE CASCADE
  );
END;
GO

IF OBJECT_ID('dbo.Messages', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.Messages (
    MessageID BIGINT IDENTITY(1,1) PRIMARY KEY,
    ConvID INT NOT NULL,
    SenderID INT NOT NULL,
    MessageText NVARCHAR(MAX) NULL,
    MediaURL NVARCHAR(500) NULL,
    MessageType NVARCHAR(20) NOT NULL DEFAULT 'text',
    SentAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    IsDeleted BIT NOT NULL DEFAULT 0,
    CONSTRAINT FK_Messages_Conversations FOREIGN KEY (ConvID) REFERENCES dbo.Conversations(ConvID) ON DELETE CASCADE,
    CONSTRAINT CK_Messages_Type CHECK (MessageType IN ('text', 'image', 'expense', 'system'))
  );
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ConversationParticipants_UserID' AND object_id = OBJECT_ID('dbo.ConversationParticipants'))
  CREATE INDEX IX_ConversationParticipants_UserID ON dbo.ConversationParticipants(UserID);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Messages_ConvID_SentAt' AND object_id = OBJECT_ID('dbo.Messages'))
  CREATE INDEX IX_Messages_ConvID_SentAt ON dbo.Messages(ConvID, SentAt, MessageID);
GO
