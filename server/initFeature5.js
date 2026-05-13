const sql = require('mssql');
require('dotenv').config({ path: './server/.env' });

const config = {
  user:             process.env.DB_USER,
  password:         process.env.DB_PASSWORD,
  server:           process.env.DB_SERVER,
  database:         process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

async function init() {
  try {
    const pool = await sql.connect(config);
    console.log('✅ Connected to SQL Server');

    console.log('🛠️ Creating Feature 5 tables...');

    await pool.request().query(`
      -- 1. Itineraries (AI Header Table)
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Itineraries')
      CREATE TABLE Itineraries (
        ItineraryID   INT IDENTITY(1,1) PRIMARY KEY,
        TripID        INT NOT NULL UNIQUE,
        GeneratedByAI BIT NOT NULL DEFAULT 1,
        CreatedAt     DATETIME DEFAULT GETDATE(),
        UpdatedAt     DATETIME DEFAULT GETDATE(),
        CONSTRAINT FK_Itin_Trip FOREIGN KEY (TripID) REFERENCES Trips(TripID)
      );

      -- 2. AIDays (AI Days)
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AIDays')
      CREATE TABLE AIDays (
        DayID       INT IDENTITY(1,1) PRIMARY KEY,
        ItineraryID INT NOT NULL,
        DayNumber   TINYINT NOT NULL,
        DayDate     DATE,
        CONSTRAINT FK_AIDay_Itin FOREIGN KEY (ItineraryID) REFERENCES Itineraries(ItineraryID),
        CONSTRAINT UQ_AIDay      UNIQUE (ItineraryID, DayNumber)
      );

      -- 3. ItineraryActivities (AI Activities)
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ItineraryActivities')
      CREATE TABLE ItineraryActivities (
        ActivityID     INT IDENTITY(1,1) PRIMARY KEY,
        DayID          INT NOT NULL,
        TimeSlot       NVARCHAR(20) NOT NULL
                       CHECK (TimeSlot IN ('morning','afternoon','evening')),
        Title          NVARCHAR(200) NOT NULL,
        Description    NVARCHAR(MAX),
        LocationName   NVARCHAR(200),
        DurationMinutes INT,
        EstimatedCost  DECIMAL(8,2),
        SortOrder      TINYINT DEFAULT 0,
        CONSTRAINT FK_Act_Day FOREIGN KEY (DayID) REFERENCES AIDays(DayID)
      );

      -- 4. Update Feature 4 tables for AI markers
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ItineraryDays') AND name = 'AIGenerated')
      ALTER TABLE ItineraryDays ADD AIGenerated BIT DEFAULT 0;
    `);

    console.log('✅ Feature 5 tables initialized successfully!');
    await pool.close();
  } catch (err) {
    console.error('❌ Error initializing Feature 5:', err.message);
    process.exit(1);
  }
}

init();
