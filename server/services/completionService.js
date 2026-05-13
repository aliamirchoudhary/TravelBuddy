const { sql, poolPromise } = require('../db');

/**
 * Recalculate and persist CompletionPct for a trip.
 * Weights: destination(15) + dates(10) + itinerary(20) + budget(15) + buddy(15) + hotel(15) + todo(10) = 100
 */
async function updateCompletionPct(tripId) {
  const pool = await poolPromise;

  const r = await pool.request()
    .input('tid', sql.Int, tripId)
    .query(`
      SELECT
        -- destination set?
        CASE WHEN t.DestinationCityID IS NOT NULL THEN 15 ELSE 0 END AS destPts,
        -- dates set?
        CASE WHEN t.StartDate IS NOT NULL AND t.EndDate IS NOT NULL THEN 10 ELSE 0 END AS datePts,
        -- itinerary has at least one item?
        CASE WHEN EXISTS (
          SELECT 1 FROM ItineraryDays id2
          JOIN ItineraryItems ii ON ii.DayID = id2.DayID
          WHERE id2.TripID = @tid
        ) THEN 20 ELSE 0 END AS itinPts,
        -- budget set?
        CASE WHEN EXISTS (SELECT 1 FROM TripBudget WHERE TripID=@tid AND TotalBudget > 0) THEN 15 ELSE 0 END AS budgPts,
        -- buddy connected?
        CASE WHEN EXISTS (
          SELECT 1 FROM TripCollaborators WHERE TripID=@tid AND Role='buddy'
        ) THEN 15 ELSE 0 END AS buddyPts,
        -- at least one hotel item in itinerary?
        CASE WHEN EXISTS (
          SELECT 1 FROM ItineraryItems ii2
          JOIN ItineraryDays id3 ON id3.DayID = ii2.DayID
          WHERE id3.TripID = @tid AND ii2.PlaceType = 'hotel'
        ) THEN 15 ELSE 0 END AS hotelPts,
        -- at least one todo?
        CASE WHEN EXISTS (SELECT 1 FROM TodoItems WHERE TripID=@tid) THEN 10 ELSE 0 END AS todoPts
      FROM Trips t WHERE t.TripID = @tid
    `);

  const row = r.recordset[0];
  if (!row) return;

  const pct = (row.destPts + row.datePts + row.itinPts + row.budgPts +
               row.buddyPts + row.hotelPts + row.todoPts);

  await pool.request()
    .input('pct', sql.TinyInt, pct)
    .input('tid', sql.Int, tripId)
    .query(`UPDATE Trips SET CompletionPct = @pct WHERE TripID = @tid`);

  return pct;
}

module.exports = { updateCompletionPct };
