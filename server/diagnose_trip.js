require('dotenv').config();
const { sql, poolPromise } = require('./db');

async function diagnose() {
  try {
    const pool = await poolPromise;
    const tripId = 25;

    // Test 1: Basic trip query
    console.log('--- Test 1: Trips table ---');
    try {
      const r = await pool.request().input('tid', sql.Int, tripId).query(
        `SELECT t.*, c.Name AS CityName FROM Trips t LEFT JOIN Cities c ON c.CityID=t.DestinationCityID WHERE t.TripID=@tid`
      );
      console.log('OK, rows:', r.recordset.length);
    } catch(e) { console.error('FAIL:', e.message); }

    // Test 2: Full trip query with SelectedHotelID
    console.log('\n--- Test 2: Full trip query (with SelectedHotelID, CountryCurrencyCode etc) ---');
    try {
      const r = await pool.request().input('tid', sql.Int, tripId).query(`
        SELECT t.*, c.Name AS CityName, c.AvgDailyBudget AS CityAvgDailyBudget,
               co.Name AS CountryName, co.FlagEmoji,
               co.CurrencyCode AS CountryCurrencyCode,
               co.LanguageCode, co.SafetyRating
        FROM Trips t
        LEFT JOIN Cities    c  ON c.CityID    =t.DestinationCityID
        LEFT JOIN Countries co ON co.CountryID=c.CountryID
        WHERE t.TripID=@tid`);
      console.log('OK, rows:', r.recordset.length);
    } catch(e) { console.error('FAIL:', e.message); }

    // Test 3: ItineraryDays
    console.log('\n--- Test 3: ItineraryDays ---');
    try {
      const r = await pool.request().input('tid', sql.Int, tripId).query(`
        SELECT d.*, (
          SELECT ii.ItemID,ii.SortOrder,ii.TimeSlot,ii.Title,ii.Description,
                 ii.PlaceType,ii.PlaceID,ii.DurationMins,ii.Cost,ii.Currency
          FROM ItineraryItems ii WHERE ii.DayID=d.DayID ORDER BY ii.SortOrder FOR JSON PATH
        ) AS Items
        FROM ItineraryDays d WHERE d.TripID=@tid ORDER BY d.DayNumber`);
      console.log('OK, rows:', r.recordset.length);
    } catch(e) { console.error('FAIL:', e.message); }

    // Test 4: TripBudget
    console.log('\n--- Test 4: TripBudget ---');
    try {
      const r = await pool.request().input('tid', sql.Int, tripId).query(`SELECT * FROM TripBudget WHERE TripID=@tid`);
      console.log('OK, rows:', r.recordset.length);
    } catch(e) { console.error('FAIL:', e.message); }

    // Test 5: BudgetItems
    console.log('\n--- Test 5: BudgetItems ---');
    try {
      const r = await pool.request().input('tid', sql.Int, tripId).query(`SELECT * FROM BudgetItems WHERE TripID=@tid ORDER BY Category`);
      console.log('OK, rows:', r.recordset.length);
    } catch(e) { console.error('FAIL:', e.message); }

    // Test 6: TodoItems
    console.log('\n--- Test 6: TodoItems ---');
    try {
      const r = await pool.request().input('tid', sql.Int, tripId).query(`SELECT * FROM TodoItems WHERE TripID=@tid ORDER BY Category,SortOrder`);
      console.log('OK, rows:', r.recordset.length);
    } catch(e) { console.error('FAIL:', e.message); }

    // Test 7: TripRoutes
    console.log('\n--- Test 7: TripRoutes ---');
    try {
      const r = await pool.request().input('tid', sql.Int, tripId).query(`SELECT * FROM TripRoutes WHERE TripID=@tid`);
      console.log('OK, rows:', r.recordset.length);
    } catch(e) { console.error('FAIL:', e.message); }

    // Test 8: TripCollaborators
    console.log('\n--- Test 8: TripCollaborators ---');
    try {
      const r = await pool.request().input('tid', sql.Int, tripId).query(`
        SELECT tc.UserID,tc.Role,u.DisplayName,u.Avatar AS AvatarURL
        FROM TripCollaborators tc JOIN Users u ON u.UserID=tc.UserID WHERE tc.TripID=@tid`);
      console.log('OK, rows:', r.recordset.length);
    } catch(e) { console.error('FAIL:', e.message); }

    // Test 9: Hotel query (with SelectedHotelID)
    console.log('\n--- Test 9: Hotel query (SelectedHotelID + fallback) ---');
    try {
      const r = await pool.request().input('tid', sql.Int, tripId).query(`
        SELECT h.HotelID, h.Name AS HotelName, h.PricePerNightAvg, h.StarRating,
          h.ThumbnailURL, h.BookingURL,
        CASE WHEN t.SelectedHotelID IS NOT NULL THEN 1 ELSE 0 END AS IsManualSelection
        FROM Trips t
        LEFT JOIN Hotels h ON h.HotelID = COALESCE(
        t.SelectedHotelID,
        (
          SELECT TOP 1 ii.PlaceID
          FROM ItineraryItems ii
          JOIN ItineraryDays d ON d.DayID = ii.DayID
          WHERE d.TripID = @tid AND ii.PlaceType = 'hotel'
          ORDER BY d.DayNumber ASC
        )
      )
      WHERE t.TripID = @tid`);
      console.log('OK, rows:', r.recordset.length);
    } catch(e) { console.error('FAIL:', e.message); }

    // Test 10: Check columns on Trips table
    console.log('\n--- Test 10: Trips table columns ---');
    try {
      const r = await pool.request().query(`
        SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='Trips' ORDER BY ORDINAL_POSITION`);
      console.log('Columns:', r.recordset.map(x => x.COLUMN_NAME).join(', '));
    } catch(e) { console.error('FAIL:', e.message); }

    // Test 11: Check Countries table columns
    console.log('\n--- Test 11: Countries table columns ---');
    try {
      const r = await pool.request().query(`
        SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='Countries' ORDER BY ORDINAL_POSITION`);
      console.log('Columns:', r.recordset.map(x => x.COLUMN_NAME).join(', '));
    } catch(e) { console.error('FAIL:', e.message); }

    process.exit(0);
  } catch(e) {
    console.error('Top-level error:', e);
    process.exit(1);
  }
}
diagnose();
