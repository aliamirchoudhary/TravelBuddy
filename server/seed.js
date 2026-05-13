require('dotenv').config();
const { poolPromise, sql } = require('./db');
const bcrypt = require('bcryptjs');

async function runSeed() {
  try {
    console.log('Connecting to database...');
    const pool = await poolPromise;

    console.log('Clearing existing data...');
    // Drop foreign keys constraints effectively by brute force delete with cautious ordering
    // We use conditional logic to prevent crashing if the user hasn't created the tables yet
    await pool.request().query(`
      IF OBJECT_ID('Restaurants', 'U') IS NOT NULL DELETE FROM Restaurants;
      IF OBJECT_ID('Hotels', 'U') IS NOT NULL DELETE FROM Hotels;
      IF OBJECT_ID('Attractions', 'U') IS NOT NULL DELETE FROM Attractions;
      IF OBJECT_ID('Cities', 'U') IS NOT NULL DELETE FROM Cities;
      IF OBJECT_ID('Countries', 'U') IS NOT NULL DELETE FROM Countries;
      
      IF OBJECT_ID('ExpenseSplits', 'U') IS NOT NULL DELETE FROM ExpenseSplits;
      IF OBJECT_ID('Expenses', 'U') IS NOT NULL DELETE FROM Expenses;
      IF OBJECT_ID('BuddyConnections', 'U') IS NOT NULL DELETE FROM BuddyConnections;
      IF OBJECT_ID('BuddyRequests', 'U') IS NOT NULL DELETE FROM BuddyRequests;
      IF OBJECT_ID('TravellerProfiles', 'U') IS NOT NULL DELETE FROM TravellerProfiles;
      IF OBJECT_ID('Users', 'U') IS NOT NULL DELETE FROM Users;

      IF OBJECT_ID('Users', 'U') IS NOT NULL DBCC CHECKIDENT ('Users', RESEED, 0);
      IF OBJECT_ID('Expenses', 'U') IS NOT NULL DBCC CHECKIDENT ('Expenses', RESEED, 0);
      IF OBJECT_ID('Countries', 'U') IS NOT NULL DBCC CHECKIDENT ('Countries', RESEED, 0);
      IF OBJECT_ID('Cities', 'U') IS NOT NULL DBCC CHECKIDENT ('Cities', RESEED, 0);
      IF OBJECT_ID('Hotels', 'U') IS NOT NULL DBCC CHECKIDENT ('Hotels', RESEED, 0);
      IF OBJECT_ID('Restaurants', 'U') IS NOT NULL DBCC CHECKIDENT ('Restaurants', RESEED, 0);
      IF OBJECT_ID('Attractions', 'U') IS NOT NULL DBCC CHECKIDENT ('Attractions', RESEED, 0);
    `);

    console.log('Creating 5 dummy users...');
    const passwordHash = await bcrypt.hash('password123', 10);
    
    // 1. Luca (1)
    // 2. Sara (2)
    // 3. Omar (3)
    // 4. Priya (4)
    // 5. Emma (5)
    
    const users = [
      { email: 'luca@test.com', name: 'Luca Moretti', avatar: '🎒' },
      { email: 'sara@test.com', name: 'Sara Kim', avatar: '📸' },
      { email: 'omar@test.com', name: 'Omar Rashid', avatar: '🏔️' },
      { email: 'priya@test.com', name: 'Priya Patel', avatar: '🌸' },
      { email: 'emma@test.com', name: 'Emma Watson', avatar: '🏄‍♀️' }
    ];

    for (const u of users) {
      await pool.request()
        .input('email', sql.NVarChar, u.email)
        .input('hash', sql.NVarChar, passwordHash)
        .input('name', sql.NVarChar, u.name)
        .input('avatar', sql.NVarChar, u.avatar)
        .query(`INSERT INTO Users (Email, PasswordHash, DisplayName, Avatar) VALUES (@email, @hash, @name, @avatar)`);
    }

    console.log('Creating Traveller Profiles...');
    // Ensure TravelStyles exist
    await pool.request().query(`
      IF NOT EXISTS (SELECT 1 FROM TravelStyles) 
      INSERT INTO TravelStyles (StyleName) VALUES ('Adventure'), ('Cultural'), ('Relaxation'), ('Foodie'), ('Mixed');
    `);

    // Assign styles
    const profiles = [
      { id: 1, min: 50, max: 200, style: 1, ageMin: 20, ageMax: 35, bio: 'Student backpacker exploring Asia on a budget.' },
      { id: 2, min: 200, max: 1000, style: 3, ageMin: 25, ageMax: 45, bio: 'Digital nomad looking for aesthetic resorts and cafes.' },
      { id: 3, min: 100, max: 400, style: 1, ageMin: 25, ageMax: 40, bio: 'High altitude hiking and extreme sports.' },
      { id: 4, min: 150, max: 500, style: 2, ageMin: 30, ageMax: 50, bio: 'Culture enthusiast exploring ancient ruins.' },
      { id: 5, min: 80, max: 300, style: 4, ageMin: 20, ageMax: 30, bio: 'Foodie searching for the best street food globally.' }
    ];

    for (const p of profiles) {
      await pool.request()
        .input('uid', sql.Int, p.id)
        .input('min', sql.Decimal(10,2), p.min)
        .input('max', sql.Decimal(10,2), p.max)
        .input('sid', sql.Int, p.style)
        .input('amin', sql.TinyInt, p.ageMin)
        .input('amax', sql.TinyInt, p.ageMax)
        .input('bio', sql.NVarChar, p.bio)
        .query(`
          INSERT INTO TravellerProfiles (UserID, BudgetMin, BudgetMax, TravelStyleID, AgeRangeMin, AgeRangeMax, GenderPref, BioText, TrustScore)
          VALUES (@uid, @min, @max, @sid, @amin, @amax, 'any', @bio, 4.8)
        `);
    }

    console.log('Establishing Mock Relationships...');
    // Create connection between Luca (1) and Sara (2) for trip 1
    await pool.request().query(`
      INSERT INTO BuddyConnections (User1ID, User2ID, TripID) VALUES (1, 2, 1);
      
      -- Mock expenses for Luca & Sara
      INSERT INTO Expenses (TripID, PaidByUserID, Description, TotalAmount, Currency) VALUES (1, 1, 'Arashiyama Ryokan (3 nights)', 690, 'USD');
      DECLARE @Exp1 INT = SCOPE_IDENTITY();
      INSERT INTO ExpenseSplits (ExpenseID, UserID, AmountOwed) VALUES (@Exp1, 1, 345);
      INSERT INTO ExpenseSplits (ExpenseID, UserID, AmountOwed) VALUES (@Exp1, 2, 345);

      INSERT INTO Expenses (TripID, PaidByUserID, Description, TotalAmount, Currency) VALUES (1, 2, 'JR Pass (7-day)', 280, 'USD');
      DECLARE @Exp2 INT = SCOPE_IDENTITY();
      INSERT INTO ExpenseSplits (ExpenseID, UserID, AmountOwed) VALUES (@Exp2, 1, 140);
      INSERT INTO ExpenseSplits (ExpenseID, UserID, AmountOwed) VALUES (@Exp2, 2, 140);
    `);

    console.log('Seeding All Explore Destinations (IDs 1-12)...');
    const exploreCities = [
      { name: 'Santorini', country: 'Greece', code: 'GR', flag: '🇬🇷', cont: 'Europe', desc: 'Stunning sunsets and blue-domed churches.' },
      { name: 'Kyoto', country: 'Japan', code: 'JP', flag: '🇯🇵', cont: 'Asia', desc: 'The cultural heart of Japan.' },
      { name: 'Patagonia', country: 'Argentina', code: 'AR', flag: '🇦🇷', cont: 'South America', desc: 'Glaciers and mountain peaks.' },
      { name: 'Marrakech', country: 'Morocco', code: 'MA', flag: '🇲🇦', cont: 'Africa', desc: 'Bustling souks and vibrant markets.' },
      { name: 'Bali', country: 'Indonesia', code: 'ID', flag: '🇮🇩', cont: 'Asia', desc: 'Island of the Gods.' },
      { name: 'Cappadocia', country: 'Turkey', code: 'TR', flag: '🇹🇷', cont: 'Europe', desc: 'Unique rock formations and hot air balloons.' },
      { name: 'Faroe Islands', country: 'Denmark', code: 'DK', flag: '🇩🇰', cont: 'Europe', desc: 'Remote archipelago with dramatic landscapes.' },
      { name: 'Petra', country: 'Jordan', code: 'JO', flag: '🇯🇴', cont: 'Asia', desc: 'The Rose City carved into stone.' },
      { name: 'Serengeti', country: 'Tanzania', code: 'TZ', flag: '🇹🇿', cont: 'Africa', desc: 'Wildlife and vast savannahs.' },
      { name: 'Dubai', country: 'UAE', code: 'AE', flag: '🇦🇪', cont: 'Asia', desc: 'Luxury, skyscrapers, and desert adventures.' },
      { name: 'Sahara Desert', country: 'Morocco', code: 'MA', flag: '🇲🇦', cont: 'Africa', desc: 'Endless golden dunes.' },
      { name: 'Maldives', country: 'Maldives', code: 'MV', flag: '🇲🇻', cont: 'Asia', desc: 'Paradise atolls and overwater bungalows.' }
    ];

    for (const cityInfo of exploreCities) {
      await pool.request().query(`
        IF NOT EXISTS (SELECT 1 FROM Countries WHERE CountryCode = '${cityInfo.code}')
        INSERT INTO Countries (Name, CountryCode, FlagEmoji, Continent) VALUES ('${cityInfo.country}', '${cityInfo.code}', '${cityInfo.flag}', '${cityInfo.cont}');
      `);
      
      await pool.request().query(`
        DECLARE @C_ID INT = (SELECT CountryID FROM Countries WHERE CountryCode = '${cityInfo.code}');
        INSERT INTO Cities (CountryID, Name, Description, BestSeasonVisit, AvgDailyBudget)
        VALUES (@C_ID, '${cityInfo.name}', '${cityInfo.desc}', 'Year-round', 100.00);
      `);
    }

    console.log('✅ DB successfully seeded!');
    process.exit(0);
  } catch(e) {
    console.error('Seed Failed!', e);
    process.exit(1);
  }
}

runSeed();
