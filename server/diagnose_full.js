require('dotenv').config();
const { sql, poolPromise } = require('./db');

async function go() {
  const pool = await poolPromise;
  const userId = 1;
  const tripId = 25;

  // Step 1: check collaborator
  const collab = await pool.request()
    .input('uid', sql.Int, userId)
    .input('tid', sql.Int, tripId)
    .query(`SELECT Role FROM TripCollaborators WHERE UserID=@uid AND TripID=@tid`);
  console.log('collab:', JSON.stringify(collab.recordset));
  if (!collab.recordset.length) {
    console.log('NOT a collaborator — this would cause 403, not 500. Trying userId from trips table...');
    const owner = await pool.request().input('tid', sql.Int, tripId).query(`SELECT UserID FROM Trips WHERE TripID=@tid`);
    console.log('Trip owner UserID:', owner.recordset[0]?.UserID);
  }

  // Step 2: run all 8 queries via Promise.all — exactly as getTripDetail does
  console.log('\nRunning Promise.all with all 8 queries...');
  try {
    const [tripRes, daysRes, budgetRes, budgetItemsRes, todosRes, routesRes, collaboratorsRes, hotelRes] = await Promise.all([
      pool.request().input('tid', sql.Int, tripId).query(`
        SELECT t.*, c.Name AS CityName, c.AvgDailyBudget AS CityAvgDailyBudget,
               co.Name AS CountryName, co.FlagEmoji,
               co.CurrencyCode AS CountryCurrencyCode,
               co.LanguageCode, co.SafetyRating
        FROM Trips t
        LEFT JOIN Cities    c  ON c.CityID    =t.DestinationCityID
        LEFT JOIN Countries co ON co.CountryID=c.CountryID
        WHERE t.TripID=@tid`),
      pool.request().input('tid', sql.Int, tripId).query(`
        SELECT d.*, (
          SELECT ii.ItemID,ii.SortOrder,ii.TimeSlot,ii.Title,ii.Description,
                 ii.PlaceType,ii.PlaceID,ii.DurationMins,ii.Cost,ii.Currency
          FROM ItineraryItems ii WHERE ii.DayID=d.DayID ORDER BY ii.SortOrder FOR JSON PATH
        ) AS Items
        FROM ItineraryDays d WHERE d.TripID=@tid ORDER BY d.DayNumber`),
      pool.request().input('tid', sql.Int, tripId).query(`SELECT * FROM TripBudget WHERE TripID=@tid`),
      pool.request().input('tid', sql.Int, tripId).query(`SELECT * FROM BudgetItems WHERE TripID=@tid ORDER BY Category`),
      pool.request().input('tid', sql.Int, tripId).query(`SELECT * FROM TodoItems WHERE TripID=@tid ORDER BY Category,SortOrder`),
      pool.request().input('tid', sql.Int, tripId).query(`SELECT * FROM TripRoutes WHERE TripID=@tid`),
      pool.request().input('tid', sql.Int, tripId).query(`
        SELECT tc.UserID,tc.Role,u.DisplayName,u.Avatar AS AvatarURL
        FROM TripCollaborators tc JOIN Users u ON u.UserID=tc.UserID WHERE tc.TripID=@tid`),
      pool.request().input('tid', sql.Int, tripId).query(`
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
      WHERE t.TripID = @tid`),
    ]);

    console.log('SUCCESS! Trip:', tripRes.recordset[0]?.TripName);
    console.log('Days:', daysRes.recordset.length);
    console.log('Budget:', budgetRes.recordset.length);
    console.log('BudgetItems:', budgetItemsRes.recordset.length);
    console.log('Todos:', todosRes.recordset.length);
    console.log('Routes:', routesRes.recordset.length);
    console.log('Collaborators:', collaboratorsRes.recordset.length);
    console.log('Hotel:', hotelRes.recordset.length);
  } catch (e) {
    console.error('Promise.all FAILED:', e.message);
    console.error('Full error:', e);
  }

  process.exit(0);
}
go().catch(e => { console.error('TOP ERROR:', e.message); process.exit(1); });
