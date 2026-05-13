-- ── Feature 9: Template & Share Schema Additions ───────────────────────────
-- Append to server/schema.sql

-- Template definitions
CREATE TABLE TodoTemplates (
  TemplateID   INT IDENTITY(1,1) PRIMARY KEY,
  Name         NVARCHAR(50)  NOT NULL UNIQUE,   -- 'International','Domestic','Beach','Hiking','Business'
  Icon         NVARCHAR(10),
  Description  NVARCHAR(200),
  CreatedAt    DATETIME DEFAULT GETDATE()
);

-- Template items
CREATE TABLE TodoTemplateItems (
  ItemID       INT IDENTITY(1,1) PRIMARY KEY,
  TemplateID   INT           NOT NULL,
  Category     NVARCHAR(50)  NOT NULL,
  Task         NVARCHAR(300) NOT NULL,
  SortOrder    INT DEFAULT 0,
  CONSTRAINT FK_TTI_Template FOREIGN KEY (TemplateID) REFERENCES TodoTemplates(TemplateID)
);

-- Read-only share tokens
CREATE TABLE TodoShareTokens (
  TokenID      INT IDENTITY(1,1) PRIMARY KEY,
  TripID       INT           NOT NULL,
  UserID       INT           NOT NULL,
  Token        NVARCHAR(64)  NOT NULL UNIQUE,
  CreatedAt    DATETIME DEFAULT GETDATE(),
  ExpiresAt    DATETIME,                        -- NULL = no expiry
  CONSTRAINT FK_TST_Trip FOREIGN KEY (TripID) REFERENCES Trips(TripID),
  CONSTRAINT FK_TST_User FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- Extend TodoItems category constraint to include On-the-Day
-- (If you have a CHECK constraint on Category, add 'On-the-Day' to it)
-- ALTER TABLE TodoItems DROP CONSTRAINT IF EXISTS CK_TodoItems_Category;
-- ALTER TABLE TodoItems ADD CONSTRAINT CK_TodoItems_Category
--   CHECK (Category IN ('General','Packing','Documents','Bookings','Health','Finance','On-the-Day'));

-- ── Seed: Template definitions ───────────────────────────────────────────────
INSERT INTO TodoTemplates (Name, Icon, Description) VALUES
('International', N'✈️', 'Full international travel checklist'),
('Domestic',      N'🚗', 'Quick domestic trip list'),
('Beach',         N'🏖️', 'Beach holiday essentials'),
('Hiking',        N'🥾', 'Hiking and trail adventure'),
('Business',      N'💼', 'Business travel essentials');

-- International items
DECLARE @IntlID INT = (SELECT TemplateID FROM TodoTemplates WHERE Name='International');
INSERT INTO TodoTemplateItems (TemplateID, Category, Task, SortOrder) VALUES
(@IntlID,'Documents', 'Check passport expiry (6+ months validity)', 1),
(@IntlID,'Documents', 'Apply / print visa if required', 2),
(@IntlID,'Documents', 'Print travel insurance policy', 3),
(@IntlID,'Documents', 'Print hotel & flight confirmations', 4),
(@IntlID,'Documents', 'Make copies of all documents (leave with family)', 5),
(@IntlID,'Bookings',  'Check in online (24–48h before flight)', 6),
(@IntlID,'Bookings',  'Book airport transfer / taxi', 7),
(@IntlID,'Bookings',  'Notify bank of travel dates', 8),
(@IntlID,'Finance',   'Get local currency / travel card', 9),
(@IntlID,'Finance',   'Set travel spending budget', 10),
(@IntlID,'Health',    'Check required vaccinations', 11),
(@IntlID,'Health',    'Pack prescribed medications (+ extra supply)', 12),
(@IntlID,'Health',    'Buy travel insurance', 13),
(@IntlID,'Packing',   'Universal power adapter', 14),
(@IntlID,'Packing',   'Phone charger & portable power bank', 15),
(@IntlID,'Packing',   'Toiletries (100ml limit for carry-on)', 16),
(@IntlID,'Packing',   'Appropriate clothing for destination climate', 17),
(@IntlID,'On-the-Day','Set departure alarm (arrive 3h early for international)', 18),
(@IntlID,'On-the-Day','Check airport terminal and gate', 19),
(@IntlID,'On-the-Day','Charge all devices before leaving', 20);

-- Domestic items
DECLARE @DomID INT = (SELECT TemplateID FROM TodoTemplates WHERE Name='Domestic');
INSERT INTO TodoTemplateItems (TemplateID, Category, Task, SortOrder) VALUES
(@DomID,'Documents', 'Photo ID / driver''s license', 1),
(@DomID,'Documents', 'Booking confirmation screenshots', 2),
(@DomID,'Bookings',  'Online check-in if flying', 3),
(@DomID,'Finance',   'Confirm card works at destination', 4),
(@DomID,'Packing',   'Phone charger', 5),
(@DomID,'Packing',   'Toiletries', 6),
(@DomID,'Packing',   'Weather-appropriate clothing', 7),
(@DomID,'On-the-Day','Set departure alarm', 8),
(@DomID,'On-the-Day','Check traffic / transport delays', 9);

-- Beach items
DECLARE @BeachID INT = (SELECT TemplateID FROM TodoTemplates WHERE Name='Beach');
INSERT INTO TodoTemplateItems (TemplateID, Category, Task, SortOrder) VALUES
(@BeachID,'Packing',   'Sunscreen (SPF 50+)', 1),
(@BeachID,'Packing',   'Swimwear (pack 2)', 2),
(@BeachID,'Packing',   'Beach towel', 3),
(@BeachID,'Packing',   'Sunglasses & sun hat', 4),
(@BeachID,'Packing',   'After-sun / aloe vera', 5),
(@BeachID,'Packing',   'Waterproof phone pouch', 6),
(@BeachID,'Packing',   'Light linen clothing', 7),
(@BeachID,'Packing',   'Flip flops & comfortable walking shoes', 8),
(@BeachID,'Health',    'Insect repellent', 9),
(@BeachID,'Health',    'Antihistamines', 10),
(@BeachID,'Documents', 'Travel insurance with water sports cover', 11),
(@BeachID,'Bookings',  'Pre-book snorkelling / water activities', 12);

-- Hiking items
DECLARE @HikeID INT = (SELECT TemplateID FROM TodoTemplates WHERE Name='Hiking');
INSERT INTO TodoTemplateItems (TemplateID, Category, Task, SortOrder) VALUES
(@HikeID,'Packing',   'Hiking boots (broken in)', 1),
(@HikeID,'Packing',   'Moisture-wicking base layers', 2),
(@HikeID,'Packing',   'Waterproof jacket / poncho', 3),
(@HikeID,'Packing',   'Trekking poles', 4),
(@HikeID,'Packing',   'Headlamp + extra batteries', 5),
(@HikeID,'Packing',   'Navigation (offline maps downloaded)', 6),
(@HikeID,'Packing',   'Water bottle / hydration pack (2L+)', 7),
(@HikeID,'Packing',   'High-calorie trail snacks', 8),
(@HikeID,'Packing',   'First aid kit', 9),
(@HikeID,'Health',    'Altitude sickness medication if needed', 10),
(@HikeID,'Health',    'Blister plasters', 11),
(@HikeID,'Documents', 'Park permits / trail booking confirmations', 12),
(@HikeID,'Bookings',  'Emergency contact registered with park authority', 13),
(@HikeID,'On-the-Day','Check weather forecast before setting out', 14),
(@HikeID,'On-the-Day','Share trail plan with someone not on trip', 15);

-- Business items
DECLARE @BizID INT = (SELECT TemplateID FROM TodoTemplates WHERE Name='Business');
INSERT INTO TodoTemplateItems (TemplateID, Category, Task, SortOrder) VALUES
(@BizID,'Documents', 'Business cards', 1),
(@BizID,'Documents', 'Visa / entry letter if required', 2),
(@BizID,'Documents', 'Meeting agenda / briefing docs', 3),
(@BizID,'Documents', 'Expense claim forms', 4),
(@BizID,'Bookings',  'Confirm meeting room / venue address', 5),
(@BizID,'Bookings',  'Book reliable airport → hotel transfer', 6),
(@BizID,'Finance',   'Corporate card activated for travel', 7),
(@BizID,'Finance',   'Keep all receipts', 8),
(@BizID,'Packing',   'Laptop + charger', 9),
(@BizID,'Packing',   'Presentation clicker / HDMI adapter', 10),
(@BizID,'Packing',   'Formal attire ironed and packed', 11),
(@BizID,'Packing',   'International power adapter', 12),
(@BizID,'On-the-Day','Confirm meeting time zones', 13),
(@BizID,'On-the-Day','Download offline maps / transit apps', 14);
