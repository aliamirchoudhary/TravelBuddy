const { sql, poolPromise }  = require('../db');
const { generateItinerary } = require('../services/aiService');
const redis                 = require('../redis');
const fs                    = require('fs');
const path                  = require('path');
const logFile               = path.join(__dirname, '../error.log');

function logError(context, err) {
  const msg = `[${new Date().toISOString()}] ${context}: ${err.message}\n${err.stack}\n\n`;
  fs.appendFileSync(logFile, msg);
}

// Rate limit check: max 3 AI generations per user per 24h
async function checkRateLimit(userId) {
  const key   = `ratelimit:ai:${userId}`;
  const count = await redis.get(key);
  if (count && parseInt(count) >= 3) return false;

  const pipeline = redis.pipeline();
  pipeline.incr(key);
  pipeline.expire(key, 86400);
  await pipeline.exec();
  return true;
}

// POST /api/itinerary/generate
async function generate(req, res) {
  const userId = req.user.id;
  const { tripId, cityName, countryName, days, style, interests, pace } = req.body;

  if (!cityName || !days || days < 1 || days > 30)
    return res.status(400).json({ message: 'Invalid generation parameters' });

  // Rate limit check
  const allowed = await checkRateLimit(userId);
  if (!allowed)
    return res.status(429).json({
      message: 'Daily AI generation limit reached (3/day). Try again tomorrow or build manually.'
    });

  try {
    console.log('🤖 AI Generation requested for:', { cityName, countryName, days, style });
    const itinerary = await generateItinerary({ cityName, countryName, days: parseInt(days), style, interests: interests || [], pace: pace || 'moderate' });
    res.json({ itinerary, fromCache: itinerary.fromCache || false });
  } catch (err) {
    logError('AI_GENERATE', err);
    if (err.message === 'AI_GENERATION_FAILED')
      return res.status(502).json({ message: 'AI generation failed. Try again or build manually.' });
    res.status(500).json({ message: 'Internal error during generation' });
  }
}

// POST /api/itinerary/save
async function saveItinerary(req, res) {
  const pool     = await poolPromise;
  const { tripId, itinerary, startDate } = req.body;
  const userId   = req.user.id;

  // Verify trip ownership/collaboration
  const collab = await pool.request()
    .input('uid', sql.Int, userId)
    .input('tid', sql.Int, tripId)
    .query(`SELECT Role FROM TripCollaborators WHERE UserID=@uid AND TripID=@tid`);
  if (!collab.recordset.length || collab.recordset[0].Role === 'viewer')
    return res.status(403).json({ message: 'No permission to save itinerary' });

  const transaction = new sql.Transaction(pool);
  try {
    await transaction.begin();

    // 1. Upsert Itineraries header
    const existsRes = await new sql.Request(transaction)
      .input('tid', sql.Int, tripId)
      .query(`SELECT ItineraryID FROM Itineraries WHERE TripID=@tid`);

    let itineraryId;
    if (existsRes.recordset.length) {
      itineraryId = existsRes.recordset[0].ItineraryID;
      await new sql.Request(transaction)
        .input('iid', sql.Int, itineraryId)
        .query(`DELETE FROM ItineraryActivities WHERE DayID IN (SELECT DayID FROM AIDays WHERE ItineraryID=@iid)`);
      await new sql.Request(transaction)
        .input('iid', sql.Int, itineraryId)
        .query(`DELETE FROM AIDays WHERE ItineraryID=@iid`);
      await new sql.Request(transaction)
        .input('iid', sql.Int, itineraryId)
        .query(`UPDATE Itineraries SET UpdatedAt=GETDATE() WHERE ItineraryID=@iid`);
    } else {
      const r = await new sql.Request(transaction)
        .input('tid', sql.Int, tripId)
        .query(`INSERT INTO Itineraries (TripID) OUTPUT INSERTED.ItineraryID VALUES (@tid)`);
      itineraryId = r.recordset[0].ItineraryID;
    }

    // 2. Clear Feature 4 ItineraryDays for this trip
    await new sql.Request(transaction)
      .input('tid', sql.Int, tripId)
      .query(`DELETE FROM ItineraryItems WHERE DayID IN (SELECT DayID FROM ItineraryDays WHERE TripID=@tid)`);
    await new sql.Request(transaction)
      .input('tid', sql.Int, tripId)
      .query(`DELETE FROM ItineraryDays WHERE TripID=@tid`);

    // 3. Insert days and activities
    for (const day of itinerary.days) {
      let dayDate = null;
      if (startDate) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + (day.day - 1));
        dayDate = d.toISOString().split('T')[0];
      }

      const aiDayRes = await new sql.Request(transaction)
        .input('iid',     sql.Int,    itineraryId)
        .input('dayNum',  sql.TinyInt, day.day)
        .input('dayDate', sql.Date,   dayDate)
        .query(`INSERT INTO AIDays (ItineraryID,DayNumber,DayDate) OUTPUT INSERTED.DayID VALUES (@iid,@dayNum,@dayDate)`);
      const aiDayId = aiDayRes.recordset[0].DayID;

      const f4DayRes = await new sql.Request(transaction)
        .input('tid',     sql.Int,           tripId)
        .input('dayNum',  sql.Int,            day.day)
        .input('title',   sql.NVarChar(200),  `Day ${day.day}`)
        .input('dayDate', sql.Date,            dayDate)
        .input('ai',      sql.Bit,             1)
        .query(`INSERT INTO ItineraryDays (TripID,DayNumber,Title,DayDate,AIGenerated) OUTPUT INSERTED.DayID VALUES (@tid,@dayNum,@title,@dayDate,@ai)`);
      const f4DayId = f4DayRes.recordset[0].DayID;

      for (const act of day.activities) {
        await new sql.Request(transaction)
          .input('did',   sql.Int,           aiDayId)
          .input('slot',  sql.NVarChar(20),  act.timeSlot)
          .input('title', sql.NVarChar(200), act.title)
          .input('desc',  sql.NVarChar,      act.description)
          .input('loc',   sql.NVarChar(200), act.locationName)
          .input('dur',   sql.Int,           act.durationMinutes)
          .input('cost',  sql.Decimal(8,2),  act.estimatedCost)
          .input('sort',  sql.TinyInt,       act.sortOrder)
          .query(`INSERT INTO ItineraryActivities (DayID,TimeSlot,Title,Description,LocationName,DurationMinutes,EstimatedCost,SortOrder)
                  VALUES (@did,@slot,@title,@desc,@loc,@dur,@cost,@sort)`);

        const timeLabel = act.timeSlot === 'morning' ? '09:00' : act.timeSlot === 'afternoon' ? '13:00' : '19:00';
        await new sql.Request(transaction)
          .input('did',   sql.Int,           f4DayId)
          .input('sort',  sql.Int,            act.sortOrder)
          .input('time',  sql.NVarChar(20),  timeLabel)
          .input('title', sql.NVarChar(200), act.title)
          .input('desc',  sql.NVarChar,      act.description)
          .input('type',  sql.NVarChar(20),  'custom')
          .input('dur',   sql.Int,           act.durationMinutes)
          .input('cost',  sql.Decimal(8,2),  act.estimatedCost)
          .query(`INSERT INTO ItineraryItems (DayID,SortOrder,TimeSlot,Title,Description,PlaceType,DurationMins,Cost)
                  VALUES (@did,@sort,@time,@title,@desc,@type,@dur,@cost)`);
      }
    }

    await transaction.commit();

    const { updateCompletionPct } = require('../services/completionService');
    await updateCompletionPct(tripId);

    res.json({ message: 'Itinerary saved', itineraryId });
  } catch (err) {
    await transaction.rollback();
    logError('AI_SAVE', err);
    res.status(500).json({ message: 'Failed to save itinerary' });
  }
}

// GET /api/itinerary/:tripId
async function getItinerary(req, res) {
  const pool   = await poolPromise;
  const tripId = parseInt(req.params.tripId);

  const itinRes = await pool.request()
    .input('tid', sql.Int, tripId)
    .query(`SELECT ItineraryID FROM Itineraries WHERE TripID=@tid`);
  if (!itinRes.recordset.length) return res.json({ itinerary: null });

  const itineraryId = itinRes.recordset[0].ItineraryID;

  const daysRes = await pool.request()
    .input('iid', sql.Int, itineraryId)
    .query(`
      SELECT d.DayID, d.DayNumber, d.DayDate,
        (SELECT a.ActivityID, a.TimeSlot, a.Title, a.Description,
                a.LocationName, a.DurationMinutes, a.EstimatedCost, a.SortOrder
         FROM ItineraryActivities a WHERE a.DayID = d.DayID
         ORDER BY a.SortOrder
         FOR JSON PATH) AS Activities
      FROM AIDays d WHERE d.ItineraryID=@iid
      ORDER BY d.DayNumber
    `);

  const days = daysRes.recordset.map(d => ({
    ...d,
    activities: d.Activities ? JSON.parse(d.Activities) : []
  }));

  // If AI itinerary is empty, try to fetch from manual tables (Feature 4 compatibility)
  if (days.length === 0) {
    const manualDays = await pool.request().input('tid', sql.Int, tripId).query(`
      SELECT d.DayID, d.DayNumber, d.DayDate, (
        SELECT ii.SortOrder, ii.TimeSlot, ii.Title, ii.Description,
               'custom' AS LocationName, ii.DurationMins AS DurationMinutes, ii.Cost AS EstimatedCost
        FROM ItineraryItems ii WHERE ii.DayID = d.DayID
        ORDER BY ii.SortOrder
        FOR JSON PATH
      ) AS Activities
      FROM ItineraryDays d WHERE d.TripID = @tid
      ORDER BY d.DayNumber
    `);
    
    if (manualDays.recordset.length > 0) {
      const parsedManual = manualDays.recordset.map(d => ({
        ...d,
        activities: d.Activities ? JSON.parse(d.Activities) : []
      }));
      return res.json({ itinerary: { days: parsedManual }, isManual: true });
    }
  }

  res.json({ itinerary: { days } });
}

// GET /api/itinerary/ratelimit
async function getRateLimit(req, res) {
  const key   = `ratelimit:ai:${req.user.id}`;
  const count = await redis.get(key);
  const used  = parseInt(count) || 0;
  res.json({ used, remaining: Math.max(0, 3 - used), limit: 3 });
}

module.exports = { generate, saveItinerary, getItinerary, getRateLimit };
