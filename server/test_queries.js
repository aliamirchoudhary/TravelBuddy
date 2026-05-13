require('dotenv').config();
const { poolPromise, sql } = require('./db');

async function testQuery() {
  try {
    const pool = await poolPromise;
    const userId = 1;
    console.log("Testing User Info Query...");
    await pool.request()
      .input('uid', sql.Int, userId)
      .query(`
        SELECT UserID, DisplayName, Avatar, AvatarURL, CoverPhotoURL, HomeCity,
               Role, CreatedAt, LastActiveAt
        FROM Users WHERE UserID = @uid
      `);
      
    console.log("Testing Privacy Settings Query...");
    await pool.request()
      .input('uid', sql.Int, userId)
      .query(`
        SELECT ShowTimeline, ShowExpenseHistory, ShowReviews
        FROM UserPrivacySettings WHERE UserID = @uid
      `);
      
    console.log("Testing Stats Query 1...");
    await pool.request()
      .input('uid', sql.Int, userId)
      .query(`SELECT COUNT(*) as count FROM Trips WHERE UserID=@uid AND Status='completed'`);
      
    console.log("Testing Stats Query 2 (Countries)...");
    await pool.request()
        .input('uid', sql.Int, userId)
        .query(`
          SELECT COUNT(DISTINCT co.CountryID) as count
          FROM Trips t
          JOIN Cities ci ON t.DestinationCityID = ci.CityID
          JOIN Countries co ON ci.CountryID = co.CountryID
          WHERE t.UserID = @uid AND t.Status = 'completed'
        `);
        
    console.log("Testing Reviews Count...");
    await pool.request()
      .input('uid', sql.Int, userId)
      .query(`SELECT COUNT(*) as count FROM Reviews WHERE ReviewerID = @uid`);
      
    console.log("Testing Buddies Count...");
    await pool.request()
      .input('uid', sql.Int, userId)
      .query(`
        SELECT COUNT(*) as count FROM BuddyConnections
        WHERE User1ID = @uid OR User2ID = @uid
      `);
      
    console.log("Testing Badges Query...");
    await pool.request()
      .input('uid', sql.Int, userId)
      .query(`
        SELECT b.BadgeID, b.Name, b.Description, b.IconURL, ub.EarnedAt
        FROM UserBadges ub
        JOIN Badges b ON ub.BadgeID = b.BadgeID
        WHERE ub.UserID = @uid
        ORDER BY ub.EarnedAt DESC
      `);
      
    console.log("Testing Timeline Query...");
    await pool.request()
        .input('uid', sql.Int, userId)
        .query(`
          SELECT t.TripID, t.TripName, t.StartDate, t.EndDate, t.Status,
                 ci.Name as CityName, ci.ThumbnailURL, co.Name as CountryName,
                 co.FlagEmoji, ts.StyleName as TravelStyle
          FROM Trips t
          LEFT JOIN Cities ci ON t.DestinationCityID = ci.CityID
          LEFT JOIN Countries co ON ci.CountryID = co.CountryID
          LEFT JOIN TravelStyles ts ON t.TravelStyleID = ts.StyleID
          WHERE t.UserID = @uid
          ORDER BY t.StartDate DESC
        `);

    console.log("All queries successful!");
    process.exit(0);
  } catch(e) {
    console.error("FAILED on query:", e.message);
    process.exit(1);
  }
}

testQuery();
