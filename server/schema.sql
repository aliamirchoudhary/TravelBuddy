USE TB;

-- ========================================================
-- TravelBuddy — Feature 1: Buddy Matching System
-- Database Schema (SQL Server / Azure SQL)
-- ========================================================

-- --------------------------------------------------------
-- 0. Users Table
-- --------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
  CREATE TABLE Users (
    UserID       INT IDENTITY(1,1) PRIMARY KEY,
    Email        NVARCHAR(255) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    DisplayName  NVARCHAR(100) NOT NULL,
    Avatar       NVARCHAR(100),
    Role         NVARCHAR(20) DEFAULT 'traveler',
    CreatedAt    DATETIME DEFAULT GETDATE()
  );
END;
GO

-- --------------------------------------------------------
-- 1. Travel Styles Lookup Table
-- --------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'TravelStyles')
BEGIN
  CREATE TABLE TravelStyles (
    StyleID   INT IDENTITY(1,1) PRIMARY KEY,
    StyleName NVARCHAR(50) NOT NULL
  );

  -- Seed data
  INSERT INTO TravelStyles (StyleName)
  VALUES ('Adventure'), ('Cultural'), ('Relaxation'), ('Foodie'), ('Mixed');
END;
GO

-- --------------------------------------------------------
-- 2. Traveller Profiles
-- --------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'TravellerProfiles')
BEGIN
  CREATE TABLE TravellerProfiles (
    UserID         INT PRIMARY KEY,                         -- FK → Users.UserID
    BudgetMin      DECIMAL(10,2),
    BudgetMax      DECIMAL(10,2),
    TravelStyleID  INT,                                     -- FK → TravelStyles.StyleID
    AgeRangeMin    TINYINT,
    AgeRangeMax    TINYINT,
    GenderPref     NVARCHAR(20),                            -- 'male','female','any'
    BioText        NVARCHAR(MAX),
    TrustScore     DECIMAL(3,2) DEFAULT 0.00,              -- 0.00 to 5.00
    TripsCompleted INT DEFAULT 0,

    CONSTRAINT FK_Profile_User   FOREIGN KEY (UserID)        REFERENCES Users(UserID),
    CONSTRAINT FK_Profile_Style  FOREIGN KEY (TravelStyleID) REFERENCES TravelStyles(StyleID)
  );
END;
GO

-- --------------------------------------------------------
-- 3. Buddy Requests
-- --------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'BuddyRequests')
BEGIN
  CREATE TABLE BuddyRequests (
    RequestID    INT IDENTITY(1,1) PRIMARY KEY,
    SenderID     INT NOT NULL,                             -- FK → Users.UserID
    ReceiverID   INT NOT NULL,                             -- FK → Users.UserID
    TripID       INT,                                      -- FK → Trips.TripID (nullable)
    Status       NVARCHAR(20) DEFAULT 'pending',           -- 'pending','accepted','declined'
    SentAt       DATETIME DEFAULT GETDATE(),
    RespondedAt  DATETIME,

    CONSTRAINT FK_Req_Sender   FOREIGN KEY (SenderID)   REFERENCES Users(UserID),
    CONSTRAINT FK_Req_Receiver FOREIGN KEY (ReceiverID) REFERENCES Users(UserID)
  );
END;
GO

-- --------------------------------------------------------
-- 4. Buddy Connections
-- --------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'BuddyConnections')
BEGIN
  CREATE TABLE BuddyConnections (
    ConnectionID INT IDENTITY(1,1) PRIMARY KEY,
    User1ID      INT NOT NULL,                             -- FK → Users.UserID
    User2ID      INT NOT NULL,                             -- FK → Users.UserID
    TripID       INT,                                      -- FK → Trips.TripID
    ConnectedAt  DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_Conn_User1 FOREIGN KEY (User1ID) REFERENCES Users(UserID),
    CONSTRAINT FK_Conn_User2 FOREIGN KEY (User2ID) REFERENCES Users(UserID)
  );
END;
GO

-- --------------------------------------------------------
-- 5. User Interest Tags (future extension for Dimension 5)
-- --------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'UserInterestTags')
BEGIN
  CREATE TABLE UserInterestTags (
    UserID  INT REFERENCES Users(UserID),
    TagName NVARCHAR(50),
    PRIMARY KEY (UserID, TagName)
  );
END;
GO

-- --------------------------------------------------------
-- Indexes for performance
-- --------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_BuddyRequests_Sender')
  CREATE INDEX IX_BuddyRequests_Sender ON BuddyRequests(SenderID, Status);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_BuddyRequests_Receiver')
  CREATE INDEX IX_BuddyRequests_Receiver ON BuddyRequests(ReceiverID, Status);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_BuddyConnections_Users')
  CREATE INDEX IX_BuddyConnections_Users ON BuddyConnections(User1ID, User2ID);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_TravellerProfiles_Budget')
  CREATE INDEX IX_TravellerProfiles_Budget ON TravellerProfiles(BudgetMin, BudgetMax);
GO

-- ==========================================
-- FEATURE 2: EXPENSE SHARING
-- ==========================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Expenses]') AND type in (N'U'))
BEGIN
  CREATE TABLE Expenses (
    ExpenseID     INT IDENTITY(1,1) PRIMARY KEY,
    TripID        INT NOT NULL,                         -- FK → Trips.TripID
    PaidByUserID  INT NOT NULL,                         -- FK → Users.UserID
    Description   NVARCHAR(200) NOT NULL,
    TotalAmount   DECIMAL(10,2) NOT NULL,
    Currency      CHAR(3) NOT NULL DEFAULT 'PKR',       -- ISO 4217: 'PKR','USD','EUR'
    CreatedAt     DATETIME DEFAULT GETDATE(),

    -- In a real DB with these tables existing, you would uncomment these FK constraints:
    -- CONSTRAINT FK_Exp_Trip FOREIGN KEY (TripID)       REFERENCES Trips(TripID),
    -- CONSTRAINT FK_Exp_User FOREIGN KEY (PaidByUserID) REFERENCES Users(UserID)
  );
END

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ExpenseSplits]') AND type in (N'U'))
BEGIN
  CREATE TABLE ExpenseSplits (
    SplitID     INT IDENTITY(1,1) PRIMARY KEY,
    ExpenseID   INT NOT NULL,                           -- FK → Expenses.ExpenseID
    UserID      INT NOT NULL,                           -- FK → Users.UserID (participant who owes)
    AmountOwed  DECIMAL(10,2) NOT NULL,
    IsSettled   BIT DEFAULT 0,
    SettledAt   DATETIME NULL,

    CONSTRAINT FK_Split_Expense FOREIGN KEY (ExpenseID) REFERENCES Expenses(ExpenseID),
    -- CONSTRAINT FK_Split_User    FOREIGN KEY (UserID)    REFERENCES Users(UserID)
  );
END
GO

-- ==========================================
-- FEATURE 3: DESTINATION DATABASE
-- ==========================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Countries]') AND type in (N'U'))
BEGIN
  CREATE TABLE Countries (
    CountryID    INT IDENTITY(1,1) PRIMARY KEY,
    Name         NVARCHAR(100) NOT NULL,
    CountryCode  CHAR(2) NOT NULL UNIQUE,
    FlagEmoji    NVARCHAR(10),
    Continent    NVARCHAR(50),
    VisaInfoText NVARCHAR(MAX),
    CurrencyCode   CHAR(3),
    CurrencyName   NVARCHAR(50),
    CurrencySymbol NVARCHAR(10),
    LanguageCode   NVARCHAR(50),
    SafetyRating   TINYINT CHECK (SafetyRating BETWEEN 1 AND 5)
  );
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Cities]') AND type in (N'U'))
BEGIN
  CREATE TABLE Cities (
    CityID           INT IDENTITY(1,1) PRIMARY KEY,
    CountryID        INT NOT NULL,
    Name             NVARCHAR(100) NOT NULL,
    Description      NVARCHAR(MAX),
    ThumbnailURL     NVARCHAR(500),
    Latitude         DECIMAL(9,6),
    Longitude        DECIMAL(9,6),
    BestSeasonVisit  NVARCHAR(100),
    AvgDailyBudget   DECIMAL(8,2),

    CONSTRAINT FK_City_Country FOREIGN KEY (CountryID) REFERENCES Countries(CountryID)
  );
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Attractions]') AND type in (N'U'))
BEGIN
  CREATE TABLE Attractions (
    AttractionID    INT IDENTITY(1,1) PRIMARY KEY,
    CityID          INT NOT NULL,
    Name            NVARCHAR(200) NOT NULL,
    Category        NVARCHAR(30) NOT NULL CHECK (Category IN ('nature','history','food','nightlife','adventure','shopping')),
    Description     NVARCHAR(MAX),
    TicketPriceAvg  DECIMAL(8,2),
    OpenHours       NVARCHAR(200),
    ThumbnailURL    NVARCHAR(500),
    Latitude        DECIMAL(9,6),
    Longitude       DECIMAL(9,6),
    TrustScore      DECIMAL(3,2) DEFAULT 0.00,

    CONSTRAINT FK_Attr_City FOREIGN KEY (CityID) REFERENCES Cities(CityID)
  );
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Hotels]') AND type in (N'U'))
BEGIN
  CREATE TABLE Hotels (
    HotelID          INT IDENTITY(1,1) PRIMARY KEY,
    CityID           INT NOT NULL,
    Name             NVARCHAR(200) NOT NULL,
    StarRating       TINYINT CHECK (StarRating BETWEEN 1 AND 5),
    PricePerNightAvg DECIMAL(8,2),
    ThumbnailURL     NVARCHAR(500),
    GooglePlaceID    NVARCHAR(100) UNIQUE,
    BookingURL       NVARCHAR(500),
    Latitude         DECIMAL(9,6),
    Longitude        DECIMAL(9,6),
    TrustScore       DECIMAL(3,2) DEFAULT 0.00,

    CONSTRAINT FK_Hotel_City FOREIGN KEY (CityID) REFERENCES Cities(CityID)
  );
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Restaurants]') AND type in (N'U'))
BEGIN
  CREATE TABLE Restaurants (
    RestaurantID  INT IDENTITY(1,1) PRIMARY KEY,
    CityID        INT NOT NULL,
    Name          NVARCHAR(200) NOT NULL,
    Cuisine       NVARCHAR(100),
    PriceRange    TINYINT CHECK (PriceRange BETWEEN 1 AND 4),
    ThumbnailURL  NVARCHAR(500),
    GooglePlaceID NVARCHAR(100) UNIQUE,
    Latitude      DECIMAL(9,6),
    Longitude     DECIMAL(9,6),
    TrustScore    DECIMAL(3,2) DEFAULT 0.00,

    CONSTRAINT FK_Rest_City FOREIGN KEY (CityID) REFERENCES Cities(CityID)
  );
END
GO

-- ==========================================
-- FEATURE 4: TRIP PLANNER DASHBOARD
-- ==========================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Trips')
BEGIN
  CREATE TABLE Trips (
    TripID            INT IDENTITY(1,1) PRIMARY KEY,
    UserID            INT NOT NULL,                        -- owner; FK → Users.UserID
    TripName          NVARCHAR(100) NOT NULL,
    DestinationCityID INT,                                 -- FK → Cities.CityID
    StartDate         DATE,
    EndDate           DATE,
    TravelStyleID     INT,                                 -- FK → TravelStyles.StyleID
    Status            NVARCHAR(20) DEFAULT 'planning'
                      CHECK (Status IN ('planning','active','completed')),
    IsShared          BIT DEFAULT 0,
    CompletionPct     TINYINT DEFAULT 0,                   -- 0–100; updated on every save
    CreatedAt         DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_Trip_User    FOREIGN KEY (UserID)            REFERENCES Users(UserID),
    CONSTRAINT FK_Trip_City    FOREIGN KEY (DestinationCityID) REFERENCES Cities(CityID),
    CONSTRAINT FK_Trip_Style   FOREIGN KEY (TravelStyleID)     REFERENCES TravelStyles(StyleID)
  );
END;

IF COL_LENGTH('Trips', 'SelectedHotelID') IS NULL
BEGIN
  ALTER TABLE Trips ADD SelectedHotelID INT NULL;
END;

IF COL_LENGTH('Trips', 'SelectedHotelID') IS NOT NULL
   AND NOT EXISTS (
     SELECT 1
     FROM sys.foreign_keys
     WHERE name = 'FK_Trips_SelectedHotel'
       AND parent_object_id = OBJECT_ID('Trips')
   )
BEGIN
  ALTER TABLE Trips
  ADD CONSTRAINT FK_Trips_SelectedHotel
  FOREIGN KEY (SelectedHotelID) REFERENCES Hotels(HotelID);
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'TripCollaborators')
BEGIN
  CREATE TABLE TripCollaborators (
    TripID    INT NOT NULL,
    UserID    INT NOT NULL,
    Role      NVARCHAR(20) NOT NULL DEFAULT 'viewer'
              CHECK (Role IN ('owner','buddy','viewer')),
    AddedAt   DATETIME DEFAULT GETDATE(),

    PRIMARY KEY (TripID, UserID),
    CONSTRAINT FK_Collab_Trip FOREIGN KEY (TripID)  REFERENCES Trips(TripID),
    CONSTRAINT FK_Collab_User FOREIGN KEY (UserID)  REFERENCES Users(UserID)
  );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ItineraryDays')
BEGIN
  CREATE TABLE ItineraryDays (
    DayID     INT IDENTITY(1,1) PRIMARY KEY,
    TripID    INT NOT NULL,
    DayNumber INT NOT NULL,                                -- 1, 2, 3 ...
    DayDate   DATE,
    Title     NVARCHAR(200),                              -- e.g. 'Arrival & Old Town'
    Notes     NVARCHAR(MAX),
    AIGenerated BIT DEFAULT 0,

    CONSTRAINT FK_Day_Trip FOREIGN KEY (TripID) REFERENCES Trips(TripID),
    CONSTRAINT UQ_Day      UNIQUE (TripID, DayNumber)
  );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ItineraryItems')
BEGIN
  CREATE TABLE ItineraryItems (
    ItemID        INT IDENTITY(1,1) PRIMARY KEY,
    DayID         INT NOT NULL,
    SortOrder     INT NOT NULL DEFAULT 0,                 -- drag-to-reorder index
    TimeSlot      NVARCHAR(20),                           -- e.g. '09:00'
    Title         NVARCHAR(200) NOT NULL,
    Description   NVARCHAR(MAX),
    PlaceType     NVARCHAR(20),                           -- 'hotel','restaurant','attraction','custom'
    PlaceID       INT,                                    -- optional FK to Hotels/Restaurants/Attractions
    DurationMins  INT,
    Cost          DECIMAL(8,2),
    Currency      CHAR(3) DEFAULT 'USD',

    CONSTRAINT FK_Item_Day FOREIGN KEY (DayID) REFERENCES ItineraryDays(DayID)
  );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'TripBudget')
BEGIN
  CREATE TABLE TripBudget (
    BudgetID      INT IDENTITY(1,1) PRIMARY KEY,
    TripID        INT NOT NULL UNIQUE,                    -- one budget per trip
    TotalBudget   DECIMAL(10,2),
    Currency      CHAR(3) DEFAULT 'USD',
    UpdatedAt     DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_Budget_Trip FOREIGN KEY (TripID) REFERENCES Trips(TripID)
  );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'BudgetItems')
BEGIN
  CREATE TABLE BudgetItems (
    BudgetItemID  INT IDENTITY(1,1) PRIMARY KEY,
    TripID        INT NOT NULL,
    Category      NVARCHAR(50) NOT NULL,                  -- 'Accommodation','Food','Transport','Activities','Misc'
    Description   NVARCHAR(200),
    EstimatedCost DECIMAL(8,2) NOT NULL,
    Currency      CHAR(3) DEFAULT 'USD',
    ActualCost    DECIMAL(8,2),                           -- filled in after trip

    CONSTRAINT FK_BItem_Trip FOREIGN KEY (TripID) REFERENCES Trips(TripID)
  );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'TodoItems')
BEGIN
  CREATE TABLE TodoItems (
    TodoID        INT IDENTITY(1,1) PRIMARY KEY,
    TripID        INT NOT NULL,
    Category      NVARCHAR(50) DEFAULT 'General',         -- 'Packing','Documents','Bookings','General'
    Task          NVARCHAR(300) NOT NULL,
    IsCompleted   BIT DEFAULT 0,
    CompletedAt   DATETIME,
    SortOrder     INT DEFAULT 0,
    CreatedAt     DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_Todo_Trip FOREIGN KEY (TripID) REFERENCES Trips(TripID)
  );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'TodoTemplates')
BEGIN
  CREATE TABLE TodoTemplates (
    TemplateID   INT IDENTITY(1,1) PRIMARY KEY,
    Name         NVARCHAR(50) NOT NULL UNIQUE,
    Icon         NVARCHAR(10),
    Description  NVARCHAR(200),
    CreatedAt    DATETIME DEFAULT GETDATE()
  );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'TodoTemplateItems')
BEGIN
  CREATE TABLE TodoTemplateItems (
    ItemID      INT IDENTITY(1,1) PRIMARY KEY,
    TemplateID  INT NOT NULL,
    Category    NVARCHAR(50) NOT NULL,
    Task        NVARCHAR(300) NOT NULL,
    SortOrder   INT DEFAULT 0,
    CONSTRAINT FK_TTI_Template FOREIGN KEY (TemplateID) REFERENCES TodoTemplates(TemplateID)
  );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'TodoShareTokens')
BEGIN
  CREATE TABLE TodoShareTokens (
    TokenID     INT IDENTITY(1,1) PRIMARY KEY,
    TripID      INT NOT NULL,
    UserID      INT NOT NULL,
    Token       NVARCHAR(64) NOT NULL UNIQUE,
    CreatedAt   DATETIME DEFAULT GETDATE(),
    ExpiresAt   DATETIME,
    CONSTRAINT FK_TST_Trip FOREIGN KEY (TripID) REFERENCES Trips(TripID),
    CONSTRAINT FK_TST_User FOREIGN KEY (UserID) REFERENCES Users(UserID)
  );
END;

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_TodoShareTokens_Trip_User')
BEGIN
  CREATE INDEX IX_TodoShareTokens_Trip_User ON TodoShareTokens(TripID, UserID);
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LanguagePhrases')
BEGIN
  CREATE TABLE LanguagePhrases (
    PhraseID     INT IDENTITY(1,1) PRIMARY KEY,
    Language     NVARCHAR(50) NOT NULL,
    Category     NVARCHAR(50) NOT NULL,
    English      NVARCHAR(200) NOT NULL,
    Translation  NVARCHAR(300) NOT NULL,
    SortOrder    INT DEFAULT 0
  );
END;

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_LanguagePhrases_Language_Category')
BEGIN
  CREATE INDEX IX_LanguagePhrases_Language_Category ON LanguagePhrases(Language, Category, SortOrder);
END;

IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'TodoTemplates')
   AND NOT EXISTS (SELECT 1 FROM TodoTemplates)
BEGIN
  INSERT INTO TodoTemplates (Name, Icon, Description)
  VALUES
    ('International', N'✈️', N'Full international travel checklist'),
    ('Domestic', N'🚗', N'Quick domestic trip list'),
    ('Beach', N'🏖️', N'Beach holiday essentials'),
    ('Hiking', N'🥾', N'Hiking and trail adventure'),
    ('Business', N'💼', N'Business travel essentials');

  INSERT INTO TodoTemplateItems (TemplateID, Category, Task, SortOrder)
  SELECT t.TemplateID, v.Category, v.Task, v.SortOrder
  FROM TodoTemplates t
  JOIN (
    VALUES
      ('International','Documents','Check passport expiry (6+ months validity)',1),
      ('International','Documents','Apply / print visa if required',2),
      ('International','Documents','Print travel insurance policy',3),
      ('International','Documents','Print hotel & flight confirmations',4),
      ('International','Documents','Make copies of all documents (leave with family)',5),
      ('International','Bookings','Check in online (24-48h before flight)',6),
      ('International','Bookings','Book airport transfer / taxi',7),
      ('International','Bookings','Notify bank of travel dates',8),
      ('International','Finance','Get local currency / travel card',9),
      ('International','Finance','Set travel spending budget',10),
      ('International','Health','Check required vaccinations',11),
      ('International','Health','Pack prescribed medications (+ extra supply)',12),
      ('International','Health','Buy travel insurance',13),
      ('International','Packing','Universal power adapter',14),
      ('International','Packing','Phone charger & portable power bank',15),
      ('International','Packing','Toiletries (100ml limit for carry-on)',16),
      ('International','Packing','Appropriate clothing for destination climate',17),
      ('International','On-the-Day','Set departure alarm (arrive 3h early for international)',18),
      ('International','On-the-Day','Check airport terminal and gate',19),
      ('International','On-the-Day','Charge all devices before leaving',20),
      ('Domestic','Documents','Photo ID / driver''s license',1),
      ('Domestic','Documents','Booking confirmation screenshots',2),
      ('Domestic','Bookings','Online check-in if flying',3),
      ('Domestic','Finance','Confirm card works at destination',4),
      ('Domestic','Packing','Phone charger',5),
      ('Domestic','Packing','Toiletries',6),
      ('Domestic','Packing','Weather-appropriate clothing',7),
      ('Domestic','On-the-Day','Set departure alarm',8),
      ('Domestic','On-the-Day','Check traffic / transport delays',9),
      ('Beach','Packing','Sunscreen (SPF 50+)',1),
      ('Beach','Packing','Swimwear (pack 2)',2),
      ('Beach','Packing','Beach towel',3),
      ('Beach','Packing','Sunglasses & sun hat',4),
      ('Beach','Packing','After-sun / aloe vera',5),
      ('Beach','Packing','Waterproof phone pouch',6),
      ('Beach','Packing','Light linen clothing',7),
      ('Beach','Packing','Flip flops & comfortable walking shoes',8),
      ('Beach','Health','Insect repellent',9),
      ('Beach','Health','Antihistamines',10),
      ('Beach','Documents','Travel insurance with water sports cover',11),
      ('Beach','Bookings','Pre-book snorkelling / water activities',12),
      ('Hiking','Packing','Hiking boots (broken in)',1),
      ('Hiking','Packing','Moisture-wicking base layers',2),
      ('Hiking','Packing','Waterproof jacket / poncho',3),
      ('Hiking','Packing','Trekking poles',4),
      ('Hiking','Packing','Headlamp + extra batteries',5),
      ('Hiking','Packing','Navigation (offline maps downloaded)',6),
      ('Hiking','Packing','Water bottle / hydration pack (2L+)',7),
      ('Hiking','Packing','High-calorie trail snacks',8),
      ('Hiking','Packing','First aid kit',9),
      ('Hiking','Health','Altitude sickness medication if needed',10),
      ('Hiking','Health','Blister plasters',11),
      ('Hiking','Documents','Park permits / trail booking confirmations',12),
      ('Hiking','Bookings','Emergency contact registered with park authority',13),
      ('Hiking','On-the-Day','Check weather forecast before setting out',14),
      ('Hiking','On-the-Day','Share trail plan with someone not on trip',15),
      ('Business','Documents','Business cards',1),
      ('Business','Documents','Visa / entry letter if required',2),
      ('Business','Documents','Meeting agenda / briefing docs',3),
      ('Business','Documents','Expense claim forms',4),
      ('Business','Bookings','Confirm meeting room / venue address',5),
      ('Business','Bookings','Book reliable airport to hotel transfer',6),
      ('Business','Finance','Corporate card activated for travel',7),
      ('Business','Finance','Keep all receipts',8),
      ('Business','Packing','Laptop + charger',9),
      ('Business','Packing','Presentation clicker / HDMI adapter',10),
      ('Business','Packing','Formal attire ironed and packed',11),
      ('Business','Packing','International power adapter',12),
      ('Business','On-the-Day','Confirm meeting time zones',13),
      ('Business','On-the-Day','Download offline maps / transit apps',14)
  ) v(TemplateName, Category, Task, SortOrder)
    ON t.Name = v.TemplateName;
END;

IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'LanguagePhrases')
   AND NOT EXISTS (SELECT 1 FROM LanguagePhrases)
BEGIN
  INSERT INTO LanguagePhrases (Language, Category, English, Translation, SortOrder)
  VALUES
    ('Japanese','Greetings','Hello','Konnichiwa (こんにちは)',1),
    ('Japanese','Greetings','Goodbye','Sayonara (さようなら)',2),
    ('Japanese','Directions','Where is ...?','Doko desu ka? (どこですか?)',1),
    ('Japanese','Food','How much?','Ikura desu ka? (いくらですか?)',1),
    ('Japanese','Numbers','One','Ichi (一)',1),
    ('Japanese','Emergencies','Help!','Tasukete! (助けて!)',1),
    ('Turkish','Greetings','Hello','Merhaba',1),
    ('Turkish','Directions','Where is ...?','Nerede?',1),
    ('Turkish','Food','How much?','Bu ne kadar?',1),
    ('Turkish','Numbers','One','Bir',1),
    ('Turkish','Emergencies','Help!','Imdat!',1),
    ('Arabic','Greetings','Hello','Marhaban (مرحبا)',1),
    ('Arabic','Directions','Where is ...?','Ayna? (أين؟)',1),
    ('Arabic','Food','How much?','Bikam? (بكم؟)',1),
    ('Arabic','Numbers','One','Wahid (واحد)',1),
    ('Arabic','Emergencies','Help!','Najda! (نجدة!)',1),
    ('French','Greetings','Hello','Bonjour',1),
    ('French','Directions','Where is ...?','Ou est ...?',1),
    ('French','Food','How much?','Combien ca coute?',1),
    ('French','Numbers','One','Un',1),
    ('French','Emergencies','Help!','Au secours!',1),
    ('Spanish','Greetings','Hello','Hola',1),
    ('Spanish','Directions','Where is ...?','Donde esta ...?',1),
    ('Spanish','Food','How much?','Cuanto cuesta?',1),
    ('Spanish','Numbers','One','Uno',1),
    ('Spanish','Emergencies','Help!','Ayuda!',1),
    ('German','Greetings','Hello','Hallo',1),
    ('German','Directions','Where is ...?','Wo ist ...?',1),
    ('German','Food','How much?','Was kostet das?',1),
    ('German','Numbers','One','Eins',1),
    ('German','Emergencies','Help!','Hilfe!',1),
    ('Italian','Greetings','Hello','Ciao / Buongiorno',1),
    ('Italian','Directions','Where is ...?','Dov''e ...?',1),
    ('Italian','Food','How much?','Quanto costa?',1),
    ('Italian','Numbers','One','Uno',1),
    ('Italian','Emergencies','Help!','Aiuto!',1),
    ('Mandarin','Greetings','Hello','Ni hao (你好)',1),
    ('Mandarin','Directions','Where is ...?','... zai nali? (在哪里?)',1),
    ('Mandarin','Food','How much?','Duoshao qian? (多少钱?)',1),
    ('Mandarin','Numbers','One','Yi (一)',1),
    ('Mandarin','Emergencies','Help!','Jiuming! (救命!)',1),
    ('Thai','Greetings','Hello','Sawasdee (สวัสดี)',1),
    ('Thai','Directions','Where is ...?','... yuu thi nai? (อยู่ที่ไหน?)',1),
    ('Thai','Food','How much?','Rakha thaorai? (ราคาเท่าไร?)',1),
    ('Thai','Numbers','One','Neung (หนึ่ง)',1),
    ('Thai','Emergencies','Help!','Chuay duay! (ช่วยด้วย!)',1);
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'TripRoutes')
BEGIN
  CREATE TABLE TripRoutes (
    RouteID       INT IDENTITY(1,1) PRIMARY KEY,
    TripID        INT NOT NULL,
    FromPlace     NVARCHAR(200) NOT NULL,
    ToPlace       NVARCHAR(200) NOT NULL,
    TransportMode NVARCHAR(50),                           -- 'flight','train','bus','drive','ferry'
    DurationMins  INT,
    EstimatedCost DECIMAL(8,2),
    Currency      CHAR(3) DEFAULT 'USD',
    Notes         NVARCHAR(MAX),

    CONSTRAINT FK_Route_Trip FOREIGN KEY (TripID) REFERENCES Trips(TripID)
  );
END;

-- ==========================================
-- FEATURE 10: EMERGENCY ASSISTANCE
-- ==========================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'EmbassyContacts')
BEGIN
  CREATE TABLE EmbassyContacts (
    EmbassyID    INT IDENTITY(1,1) PRIMARY KEY,
    CountryCode  CHAR(2) NOT NULL,
    CountryName  NVARCHAR(100) NOT NULL,
    PhoneNumber  NVARCHAR(30),
    Email        NVARCHAR(100),
    Address      NVARCHAR(300),
    Website      NVARCHAR(200),
    OpeningHours NVARCHAR(200),
    Notes        NVARCHAR(500),
    UpdatedAt    DATETIME DEFAULT GETDATE()
  );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'EmergencyContacts')
BEGIN
  CREATE TABLE EmergencyContacts (
    ContactID    INT IDENTITY(1,1) PRIMARY KEY,
    TripID       INT NOT NULL,
    UserID       INT NOT NULL,
    Name         NVARCHAR(100) NOT NULL,
    Relationship NVARCHAR(50),
    PhoneNumber  NVARCHAR(30),
    Email        NVARCHAR(100),
    Notes        NVARCHAR(300),
    CreatedAt    DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_EC_Trip FOREIGN KEY (TripID) REFERENCES Trips(TripID),
    CONSTRAINT FK_EC_User FOREIGN KEY (UserID) REFERENCES Users(UserID)
  );
END;

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'EmbassyContacts')
   AND NOT EXISTS (SELECT 1 FROM EmbassyContacts)
BEGIN
  INSERT INTO EmbassyContacts (CountryCode, CountryName, PhoneNumber, Email, Address, Website, OpeningHours)
  VALUES
    ('JP', 'japan', '+81-3-3224-5000', 'TokyoACS@state.gov', '1-10-5 Akasaka, Minato, Tokyo', 'https://jp.usembassy.gov', 'Mon-Fri 08:30-17:30'),
    ('PK', 'pakistan', '+92-51-201-4000', 'IslamabadACS@state.gov', 'Diplomatic Enclave, Ramna 5, Islamabad', 'https://pk.usembassy.gov', 'Mon-Thu 08:00-17:00'),
    ('TR', 'turkey', '+90-312-455-5555', 'AnkaraACS@state.gov', '110 Ataturk Blvd, Kavaklidere, Ankara', 'https://tr.usembassy.gov', 'Mon-Fri 08:00-17:00'),
    ('GB', 'united kingdom', '+44-20-7499-9000', 'LondonACS@state.gov', '33 Nine Elms Ln, London SW11 7US', 'https://uk.usembassy.gov', 'Mon-Fri 08:30-17:00'),
    ('FR', 'france', '+33-1-4312-2222', 'ParisACS@state.gov', '2 Ave Gabriel, 75008 Paris', 'https://fr.usembassy.gov', 'Mon-Fri 09:00-12:00,14:00-16:00'),
    ('DE', 'germany', '+49-30-8305-0', 'BerlinACS@state.gov', 'Pariser Platz 2, 10117 Berlin', 'https://de.usembassy.gov', 'Mon-Fri 08:00-17:00'),
    ('IT', 'italy', '+39-06-46741', 'RomeACS@state.gov', 'Via Vittorio Veneto 121, 00187 Rome', 'https://it.usembassy.gov', 'Mon-Fri 08:30-17:30'),
    ('ES', 'spain', '+34-91-587-2200', 'MadridACS@state.gov', 'Calle de Serrano 75, 28006 Madrid', 'https://es.usembassy.gov', 'Mon-Fri 09:00-13:00'),
    ('AE', 'uae', '+971-2-414-2200', 'AbuDhabiACS@state.gov', 'Embassies District, Abu Dhabi', 'https://ae.usembassy.gov', 'Mon-Fri 08:00-17:00'),
    ('IN', 'india', '+91-11-2419-8000', 'NewDelhiACS@state.gov', 'Shantipath, Chanakyapuri, New Delhi 110021', 'https://in.usembassy.gov', 'Mon-Fri 08:00-17:00'),
    ('AU', 'australia', '+61-2-6214-5600', 'CanberraACS@state.gov', 'Moonah Place, Yarralumla, ACT 2600', 'https://au.usembassy.gov', 'Mon-Fri 08:30-17:00'),
    ('CA', 'canada', '+1-613-238-5335', 'OttawaACS@state.gov', '490 Sussex Drive, Ottawa, ON K1N 1G8', 'https://ca.usembassy.gov', 'Mon-Fri 08:30-17:00'),
    ('CN', 'china', '+86-10-8531-3000', 'BeijingACS@state.gov', '55 Anjialou Rd, Chaoyang, Beijing', 'https://china.usembassy-china.org.cn', 'Mon-Fri 08:00-17:00'),
    ('TH', 'thailand', '+66-2-205-4049', 'BangkokACS@state.gov', '95 Wireless Rd, Lumpini, Bangkok 10330', 'https://th.usembassy.gov', 'Mon-Fri 07:30-16:00'),
    ('SG', 'singapore', '+65-6476-9100', 'SingaporeACS@state.gov', '27 Napier Road, Singapore 258508', 'https://sg.usembassy.gov', 'Mon-Fri 08:00-17:00'),
    ('SA', 'saudi arabia', '+966-11-488-3800', 'RiyadhACS@state.gov', 'Collector Road M, Riyadh Diplomatic Qtr', 'https://sa.usembassy.gov', 'Sun-Thu 08:00-16:30'),
    ('MY', 'malaysia', '+60-3-2168-5000', 'KualaLumpurACS@state.gov', '376 Jalan Tun Razak, 50400 KL', 'https://my.usembassy.gov', 'Mon-Fri 07:30-16:00');
END;
