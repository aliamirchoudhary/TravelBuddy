const { sql, poolPromise } = require('../db');
const { updateCompletionPct } = require('../services/completionService');
const { populateCityIfThin } = require('../jobs/populateCity');
const fs = require('fs');
const path = require('path');
const logFile = path.join(__dirname, '../error.log');

function logError(context, err) {
  const msg = `[${new Date().toISOString()}] ${context}: ${err.message}\n${err.stack}\n\n`;
  fs.appendFileSync(logFile, msg);
}

// ── Guard ─────────────────────────────────────────────────────────────────────
async function isCollaborator(pool, userId, tripId) {
  const r = await pool.request()
    .input('uid', sql.Int, userId)
    .input('tid', sql.Int, tripId)
    .query(`SELECT Role FROM TripCollaborators WHERE UserID=@uid AND TripID=@tid`);
  return r.recordset[0] || null;
}

// ── TRIP CRUD ─────────────────────────────────────────────────────────────────

async function createTrip(req, res) {
  const pool = await poolPromise;
  const userId = req.user.id;
  const { tripName, destinationCityId, startDate, endDate, travelStyleId } = req.body;
  const transaction = new sql.Transaction(pool);
  try {
    await transaction.begin();
    const tripReq = new sql.Request(transaction);
    const tripRes = await tripReq
      .input('uid', sql.Int, userId)
      .input('name', sql.NVarChar(100), tripName || 'My Trip')
      .input('cid', sql.Int, destinationCityId || null)
      .input('sd', sql.Date, startDate || null)
      .input('ed', sql.Date, endDate || null)
      .input('style', sql.Int, travelStyleId || null)
      .query(`INSERT INTO Trips (UserID,TripName,DestinationCityID,StartDate,EndDate,TravelStyleID)
              OUTPUT INSERTED.TripID VALUES (@uid,@name,@cid,@sd,@ed,@style)`);
    const tripId = tripRes.recordset[0].TripID;
    const collabReq = new sql.Request(transaction);
    await collabReq
      .input('tid', sql.Int, tripId)
      .input('uid', sql.Int, userId)
      .input('role', sql.NVarChar, 'owner')
      .query(`INSERT INTO TripCollaborators (TripID,UserID,Role) VALUES (@tid,@uid,@role)`);
    await transaction.commit();
    if (destinationCityId) {
      const cityRow = await pool.request()
        .input('cid', sql.Int, destinationCityId)
        .query(`SELECT Name FROM Cities WHERE CityID=@cid`);
      const cityName = cityRow.recordset[0]?.Name;
      if (cityName) populateCityIfThin(destinationCityId, cityName);
    }
    await updateCompletionPct(tripId);
    res.status(201).json({ tripId, message: 'Trip created' });
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    res.status(500).json({ message: 'Failed to create trip' });
  }
}

async function getMyTrips(req, res) {
  try {
    const pool = await poolPromise;
    const r = await pool.request()
      .input('uid', sql.Int, req.user.id)
      .query(`SELECT t.TripID, t.TripName, t.StartDate, t.EndDate, t.Status,
                     t.CompletionPct, t.IsShared,
                     c.Name AS CityName, co.FlagEmoji, co.Name AS CountryName,
                     c.ThumbnailURL AS CityThumb, tc.Role
              FROM Trips t
              JOIN TripCollaborators tc ON tc.TripID=t.TripID AND tc.UserID=@uid
              LEFT JOIN Cities    c  ON c.CityID    =t.DestinationCityID
              LEFT JOIN Countries co ON co.CountryID=c.CountryID
              ORDER BY t.CreatedAt DESC`);
    res.json({ trips: r.recordset });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch trips' });
  }
}

async function getTripDetail(req, res) {
  try {
    const pool = await poolPromise;
    const userId = req.user.id;
    const tripId = parseInt(req.params.tripId);
    const collab = await isCollaborator(pool, userId, tripId);
    if (!collab) return res.status(403).json({ message: 'Not a collaborator on this trip' });

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
      // pool.request().input('tid', sql.Int, tripId).query(`
      //   SELECT TOP 1 h.HotelID, h.Name AS HotelName, h.PricePerNightAvg, h.StarRating,
      //          h.ThumbnailURL, h.BookingURL
      //   FROM ItineraryItems ii
      //   JOIN Hotels h ON h.HotelID = ii.PlaceID
      //   JOIN ItineraryDays d ON d.DayID = ii.DayID
      //   WHERE d.TripID = @tid AND ii.PlaceType = 'hotel'
      //   ORDER BY d.DayNumber ASC`),
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

    const days = daysRes.recordset.map(d => ({ ...d, Items: d.Items ? JSON.parse(d.Items) : [] }));
    res.json({
      trip: tripRes.recordset[0],
      days,
      budget: budgetRes.recordset[0] || null,
      budgetItems: budgetItemsRes.recordset,
      todos: todosRes.recordset,
      routes: routesRes.recordset,
      collaborators: collaboratorsRes.recordset,
      hotel: hotelRes.recordset[0] || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load trip details' });
  }
}

async function updateTrip(req, res) {
  try {
    const pool = await poolPromise;
    const userId = req.user.id;
    const tripId = parseInt(req.params.tripId);
    const collab = await isCollaborator(pool, userId, tripId);
    if (!collab || collab.Role === 'viewer') return res.status(403).json({ message: 'No edit permission' });

    const { tripName, destinationCityId, startDate, endDate, status, isShared } = req.body;
    await pool.request()
      .input('name', sql.NVarChar(100), tripName ?? null)
      .input('cid', sql.Int, destinationCityId ?? null)
      .input('sd', sql.Date, startDate ?? null)
      .input('ed', sql.Date, endDate ?? null)
      .input('status', sql.NVarChar(20), status ?? null)
      .input('shared', sql.Bit, isShared ?? null)
      .input('tid', sql.Int, tripId)
      .query(`UPDATE Trips SET
                TripName          = COALESCE(@name,   TripName),
                DestinationCityID = COALESCE(@cid,    DestinationCityID),
                StartDate         = COALESCE(@sd,     StartDate),
                EndDate           = COALESCE(@ed,     EndDate),
                Status            = COALESCE(@status, Status),
                IsShared          = COALESCE(@shared, IsShared)
              WHERE TripID=@tid`);

    if (status === 'completed') {
      const badgeService = require('../services/badgeService');
      const tripCount = await badgeService.getTripCount(userId);
      const countryCount = await badgeService.getCountriesVisited(userId);
      const advCount = await badgeService.getAdventureTripsCount(userId);

      badgeService.checkAndAward(userId, 'trip_count', tripCount, req.io).catch(console.error);
      badgeService.checkAndAward(userId, 'country_count', countryCount, req.io).catch(console.error);
      badgeService.checkAndAward(userId, 'adventure_trips', advCount, req.io).catch(console.error);
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      if (diffDays > 0 && diffDays < 100) {
        const existingRes = await pool.request()
          .input('tid', sql.Int, tripId)
          .query(`SELECT DayID,DayNumber FROM ItineraryDays WHERE TripID=@tid ORDER BY DayNumber`);
        
        // Add new days if trip lengthened
        for (let i = existingRes.recordset.length + 1; i <= diffDays; i++) {
          const d = new Date(start); d.setDate(start.getDate() + (i - 1));
          await pool.request()
            .input('tid', sql.Int, tripId).input('num', sql.Int, i)
            .input('date', sql.Date, d).input('title', sql.NVarChar, `Day ${i}`)
            .query(`INSERT INTO ItineraryDays (TripID,DayNumber,DayDate,Title) VALUES (@tid,@num,@date,@title)`);
        }

        // Remove extra days if trip shortened
        if (existingRes.recordset.length > diffDays) {
          await pool.request()
            .input('tid', sql.Int, tripId)
            .input('limit', sql.Int, diffDays)
            .query(`DELETE FROM ItineraryItems WHERE DayID IN (SELECT DayID FROM ItineraryDays WHERE TripID=@tid AND DayNumber > @limit)`);
          await pool.request()
            .input('tid', sql.Int, tripId)
            .input('limit', sql.Int, diffDays)
            .query(`DELETE FROM ItineraryDays WHERE TripID=@tid AND DayNumber > @limit`);
        }

        // Update existing days' dates
        for (let i = 1; i <= diffDays; i++) {
          const d = new Date(start); d.setDate(start.getDate() + (i - 1));
          await pool.request()
            .input('tid', sql.Int, tripId).input('num', sql.Int, i).input('date', sql.Date, d)
            .query(`UPDATE ItineraryDays SET DayDate=@date WHERE TripID=@tid AND DayNumber=@num`);
        }
      }
    }

    const pct = await updateCompletionPct(tripId);
    if (req.io) req.io.to(`trip:${tripId}`).emit('trip_updated', { tripId, updatedBy: userId, field: 'trip' });
    res.json({ message: 'Trip updated', completionPct: pct });
  } catch (err) {
    console.error('UpdateTrip Error:', err);
    res.status(500).json({ message: 'Update failed' });
  }
}

// ── ITINERARY ─────────────────────────────────────────────────────────────────

async function addDay(req, res) {
  try {
    const pool = await poolPromise;
    const tripId = parseInt(req.params.tripId);
    const collab = await isCollaborator(pool, req.user.id, tripId);
    if (!collab || collab.Role === 'viewer') return res.status(403).json({ message: 'No edit permission' });

    const { dayNumber, title, notes, dayDate } = req.body;
    const cleanDate = (dayDate && dayDate.trim() !== '') ? dayDate : null;
    const r = await pool.request()
      .input('tid', sql.Int, tripId)
      .input('dayNum', sql.Int, dayNumber)
      .input('title', sql.NVarChar(200), title || null)
      .input('notes', sql.NVarChar, notes || null)
      .input('date', sql.Date, cleanDate)
      .query(`IF EXISTS (SELECT 1 FROM ItineraryDays WHERE TripID=@tid AND DayNumber=@dayNum)
              BEGIN
                UPDATE ItineraryDays
                SET Title=COALESCE(@title,Title), Notes=COALESCE(@notes,Notes), DayDate=COALESCE(@date,DayDate)
                WHERE TripID=@tid AND DayNumber=@dayNum
              END
              ELSE
              BEGIN
                INSERT INTO ItineraryDays (TripID,DayNumber,Title,Notes,DayDate) VALUES (@tid,@dayNum,@title,@notes,@date)
              END
              SELECT DayID FROM ItineraryDays WHERE TripID=@tid AND DayNumber=@dayNum;`);
    const dayId = r.recordset[0].DayID;
    await updateCompletionPct(tripId);
    if (req.io) req.io.to(`trip:${tripId}`).emit('trip_updated', { tripId, updatedBy: req.user.id, field: 'itinerary' });
    res.status(201).json({ dayId, message: 'Day synced' });
  } catch (err) {
    logError('ADD_DAY', err);
    res.status(500).json({ message: 'Add/Sync day failed' });
  }
}

async function addItineraryItem(req, res) {
  try {
    const pool = await poolPromise;
    const tripId = parseInt(req.params.tripId);
    const dayId = parseInt(req.params.dayId);
    const collab = await isCollaborator(pool, req.user.id, tripId);
    if (!collab || collab.Role === 'viewer') return res.status(403).json({ message: 'No edit permission' });

    const { timeSlot, title, description, placeType, placeId, durationMins, cost, currency, sortOrder } = req.body;
    const r = await pool.request()
      .input('did', sql.Int, dayId)
      .input('sort', sql.Int, sortOrder || 0)
      .input('time', sql.NVarChar(20), timeSlot || null)
      .input('title', sql.NVarChar(200), title)
      .input('desc', sql.NVarChar, description || null)
      .input('ptype', sql.NVarChar(20), placeType || 'custom')
      .input('pid', sql.Int, placeId || null)
      .input('dur', sql.Int, durationMins || null)
      .input('cost', sql.Decimal(8, 2), cost || null)
      .input('cur', sql.Char(3), currency || 'USD')
      .query(`INSERT INTO ItineraryItems (DayID,SortOrder,TimeSlot,Title,Description,PlaceType,PlaceID,DurationMins,Cost,Currency)
              OUTPUT INSERTED.ItemID VALUES (@did,@sort,@time,@title,@desc,@ptype,@pid,@dur,@cost,@cur)`);
    await updateCompletionPct(tripId);
    if (req.io) req.io.to(`trip:${tripId}`).emit('trip_updated', { tripId, updatedBy: req.user.id, field: 'itinerary' });
    res.status(201).json({ itemId: r.recordset[0].ItemID });
  } catch (err) {
    res.status(500).json({ message: 'Add item failed' });
  }
}

async function deleteItineraryItem(req, res) {
  try {
    const pool = await poolPromise;
    const tripId = parseInt(req.params.tripId);
    const collab = await isCollaborator(pool, req.user.id, tripId);
    if (!collab || collab.Role === 'viewer') return res.status(403).json({ message: 'No edit permission' });
    await pool.request()
      .input('iid', sql.Int, parseInt(req.params.itemId))
      .query(`DELETE FROM ItineraryItems WHERE ItemID=@iid`);
    await updateCompletionPct(tripId);
    if (req.io) req.io.to(`trip:${tripId}`).emit('trip_updated', { tripId, updatedBy: req.user.id, field: 'itinerary' });
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete item failed' });
  }
}

// ── BUDGET ────────────────────────────────────────────────────────────────────

async function upsertBudget(req, res) {
  try {
    const pool = await poolPromise;
    const tripId = parseInt(req.params.tripId);
    const collab = await isCollaborator(pool, req.user.id, tripId);
    if (!collab || collab.Role === 'viewer') return res.status(403).json({ message: 'No edit permission' });

    const { totalBudget, currency } = req.body;
    await pool.request()
      .input('tid', sql.Int, tripId)
      .input('amt', sql.Decimal(10, 2), totalBudget)
      .input('cur', sql.Char(3), currency || 'USD')
      .query(`MERGE TripBudget AS target
              USING (SELECT @tid AS TripID) AS source ON target.TripID=source.TripID
              WHEN MATCHED     THEN UPDATE SET TotalBudget=@amt,Currency=@cur,UpdatedAt=GETDATE()
              WHEN NOT MATCHED THEN INSERT (TripID,TotalBudget,Currency) VALUES (@tid,@amt,@cur);`);
    await updateCompletionPct(tripId);
    if (req.io) req.io.to(`trip:${tripId}`).emit('trip_updated', { tripId, updatedBy: req.user.id, field: 'budget' });
    res.json({ message: 'Budget saved' });
  } catch (err) {
    res.status(500).json({ message: 'Upsert budget failed' });
  }
}

async function addBudgetItem(req, res) {
  try {
    const pool = await poolPromise;
    const tripId = parseInt(req.params.tripId);
    const collab = await isCollaborator(pool, req.user.id, tripId);
    if (!collab || collab.Role === 'viewer') return res.status(403).json({ message: 'No edit permission' });

    const { category, description, estimatedCost, currency } = req.body;
    const r = await pool.request()
      .input('tid', sql.Int, tripId)
      .input('cat', sql.NVarChar(50), category)
      .input('desc', sql.NVarChar(200), description || null)
      .input('est', sql.Decimal(8, 2), estimatedCost)
      .input('cur', sql.Char(3), currency || 'USD')
      .query(`INSERT INTO BudgetItems (TripID,Category,Description,EstimatedCost,Currency)
              OUTPUT INSERTED.BudgetItemID VALUES (@tid,@cat,@desc,@est,@cur)`);
    await updateCompletionPct(tripId);
    if (req.io) req.io.to(`trip:${tripId}`).emit('trip_updated', { tripId, updatedBy: req.user.id, field: 'budget' });
    res.status(201).json({ budgetItemId: r.recordset[0].BudgetItemID });
  } catch (err) {
    res.status(500).json({ message: 'Add budget item failed' });
  }
}

async function deleteBudgetItem(req, res) {
  try {
    const pool = await poolPromise;
    const tripId = parseInt(req.params.tripId);
    const itemId = parseInt(req.params.itemId);
    const collab = await isCollaborator(pool, req.user.id, tripId);
    if (!collab || collab.Role === 'viewer') return res.status(403).json({ message: 'No edit permission' });

    // Verify item belongs to this trip before deleting
    const check = await pool.request()
      .input('iid', sql.Int, itemId).input('tid', sql.Int, tripId)
      .query(`SELECT BudgetItemID FROM BudgetItems WHERE BudgetItemID=@iid AND TripID=@tid`);
    if (!check.recordset.length) return res.status(404).json({ message: 'Budget item not found' });

    await pool.request().input('iid', sql.Int, itemId).query(`DELETE FROM BudgetItems WHERE BudgetItemID=@iid`);
    await updateCompletionPct(tripId);
    if (req.io) req.io.to(`trip:${tripId}`).emit('trip_updated', { tripId, updatedBy: req.user.id, field: 'budget' });
    res.json({ message: 'Budget item deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete budget item failed' });
  }
}

// ── TO-DO ─────────────────────────────────────────────────────────────────────

async function addTodo(req, res) {
  try {
    const pool = await poolPromise;
    const tripId = parseInt(req.params.tripId);
    const collab = await isCollaborator(pool, req.user.id, tripId);
    if (!collab || collab.Role === 'viewer') return res.status(403).json({ message: 'No edit permission' });

    const { task, category, sortOrder } = req.body;
    if (!task || !task.trim()) return res.status(400).json({ message: 'Task cannot be empty' });
    const r = await pool.request()
      .input('tid', sql.Int, tripId)
      .input('cat', sql.NVarChar(50), category || 'General')
      .input('task', sql.NVarChar(300), task.trim())
      .input('sort', sql.Int, sortOrder || 0)
      .query(`INSERT INTO TodoItems (TripID,Category,Task,SortOrder)
              OUTPUT INSERTED.TodoID VALUES (@tid,@cat,@task,@sort)`);
    await updateCompletionPct(tripId);
    if (req.io) req.io.to(`trip:${tripId}`).emit('trip_updated', { tripId, updatedBy: req.user.id, field: 'todo' });
    res.status(201).json({ todoId: r.recordset[0].TodoID });
  } catch (err) {
    res.status(500).json({ message: 'Add todo failed' });
  }
}

async function toggleTodo(req, res) {
  try {
    const pool = await poolPromise;
    const tripId = parseInt(req.params.tripId);
    const todoId = parseInt(req.params.todoId);
    const userId = req.user.id;

    const collab = await isCollaborator(pool, userId, tripId);
    if (!collab || collab.Role === 'viewer') return res.status(403).json({ message: 'No edit permission' });

    await pool.request()
      .input('tid', sql.Int, tripId).input('id', sql.Int, todoId)
      .query(`UPDATE TodoItems
              SET IsCompleted=1-IsCompleted,
                  CompletedAt=CASE WHEN IsCompleted=0 THEN GETDATE() ELSE NULL END
              WHERE TodoID=@id AND TripID=@tid`);
    if (req.io) req.io.to(`trip:${tripId}`).emit('trip_updated', { tripId, updatedBy: userId, field: 'todo' });
    res.json({ message: 'Toggled' });
  } catch (err) {
    res.status(500).json({ message: 'Toggle todo failed' });
  }
}

async function deleteTodo(req, res) {
  try {
    const pool = await poolPromise;
    const tripId = parseInt(req.params.tripId);
    const todoId = parseInt(req.params.todoId);
    const collab = await isCollaborator(pool, req.user.id, tripId);
    if (!collab || collab.Role === 'viewer') return res.status(403).json({ message: 'No edit permission' });

    const check = await pool.request()
      .input('id', sql.Int, todoId).input('tid', sql.Int, tripId)
      .query(`SELECT TodoID FROM TodoItems WHERE TodoID=@id AND TripID=@tid`);
    if (!check.recordset.length) return res.status(404).json({ message: 'Todo not found' });

    await pool.request().input('id', sql.Int, todoId).query(`DELETE FROM TodoItems WHERE TodoID=@id`);
    await updateCompletionPct(tripId);
    if (req.io) req.io.to(`trip:${tripId}`).emit('trip_updated', { tripId, updatedBy: req.user.id, field: 'todo' });
    res.json({ message: 'Todo deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete todo failed' });
  }
}

async function getTodoTemplates(req, res) {
  try {
    const pool = await poolPromise;
    const r = await pool.request().query(`
      SELECT t.TemplateID, t.Name, t.Icon, t.Description,
             i.Category, i.Task, i.SortOrder
      FROM TodoTemplates t
      LEFT JOIN TodoTemplateItems i ON i.TemplateID = t.TemplateID
      ORDER BY t.Name, i.SortOrder, i.ItemID
    `);

    const byName = {};
    for (const row of r.recordset) {
      if (!byName[row.Name]) {
        byName[row.Name] = {
          templateId: row.TemplateID,
          icon: row.Icon,
          desc: row.Description,
          items: [],
        };
      }
      if (row.Task) {
        byName[row.Name].items.push({
          category: row.Category,
          task: row.Task,
          sortOrder: row.SortOrder,
        });
      }
    }

    res.json({ templates: byName });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch templates' });
  }
}

async function applyTodoTemplate(req, res) {
  try {
    const pool = await poolPromise;
    const tripId = parseInt(req.params.tripId);
    const userId = req.user.id;
    const collab = await isCollaborator(pool, userId, tripId);
    if (!collab || collab.Role === 'viewer') return res.status(403).json({ message: 'No edit permission' });

    const templateName = String(req.body.templateName || '').trim();
    if (!templateName) return res.status(400).json({ message: 'templateName is required' });

    const tpl = await pool.request()
      .input('name', sql.NVarChar(50), templateName)
      .query(`SELECT TemplateID FROM TodoTemplates WHERE Name = @name`);
    if (!tpl.recordset.length) return res.status(404).json({ message: 'Template not found' });

    const templateId = tpl.recordset[0].TemplateID;
    const items = await pool.request()
      .input('templateId', sql.Int, templateId)
      .query(`
        SELECT Category, Task, SortOrder
        FROM TodoTemplateItems
        WHERE TemplateID = @templateId
        ORDER BY SortOrder, ItemID
      `);

    if (!items.recordset.length) return res.status(400).json({ message: 'Template has no items' });

    const maxSort = await pool.request()
      .input('tid', sql.Int, tripId)
      .query(`SELECT ISNULL(MAX(SortOrder), 0) AS MaxSort FROM TodoItems WHERE TripID=@tid`);
    const baseSort = Number(maxSort.recordset[0]?.MaxSort || 0);

    const existingTodos = await pool.request()
      .input('tid', sql.Int, tripId)
      .query(`SELECT Task FROM TodoItems WHERE TripID=@tid`);
    const existingSet = new Set(existingTodos.recordset.map(t => t.Task.toLowerCase().trim()));

    let insertedCount = 0;
    for (let i = 0; i < items.recordset.length; i++) {
      const row = items.recordset[i];
      if (existingSet.has(row.Task.toLowerCase().trim())) continue;

      await pool.request()
        .input('tid', sql.Int, tripId)
        .input('cat', sql.NVarChar(50), row.Category || 'General')
        .input('task', sql.NVarChar(300), row.Task)
        .input('sort', sql.Int, baseSort + i + 1)
        .query(`
          INSERT INTO TodoItems (TripID, Category, Task, SortOrder)
          VALUES (@tid, @cat, @task, @sort)
        `);
      insertedCount++;
    }

    await updateCompletionPct(tripId);
    if (req.io) req.io.to(`trip:${tripId}`).emit('trip_updated', { tripId, updatedBy: userId, field: 'todo' });
    res.status(201).json({ inserted: insertedCount, templateName });
  } catch (err) {
    res.status(500).json({ message: 'Failed to apply template' });
  }
}

// ── ROUTES ────────────────────────────────────────────────────────────────────

async function addRoute(req, res) {
  try {
    const pool = await poolPromise;
    const tripId = parseInt(req.params.tripId);
    const collab = await isCollaborator(pool, req.user.id, tripId);
    if (!collab || collab.Role === 'viewer') return res.status(403).json({ message: 'No edit permission' });

    const { fromPlace, toPlace, transportMode, durationMins, estimatedCost, currency, notes } = req.body;
    const r = await pool.request()
      .input('tid', sql.Int, tripId)
      .input('from', sql.NVarChar(200), fromPlace)
      .input('to', sql.NVarChar(200), toPlace)
      .input('mode', sql.NVarChar(50), transportMode || null)
      .input('dur', sql.Int, durationMins || null)
      .input('cost', sql.Decimal(8, 2), estimatedCost || null)
      .input('cur', sql.Char(3), (currency || 'USD').substring(0, 3))
      .input('notes', sql.NVarChar, notes || null)
      .query(`INSERT INTO TripRoutes (TripID,FromPlace,ToPlace,TransportMode,DurationMins,EstimatedCost,Currency,Notes)
              OUTPUT INSERTED.RouteID VALUES (@tid,@from,@to,@mode,@dur,@cost,@cur,@notes)`);
    if (req.io) req.io.to(`trip:${tripId}`).emit('trip_updated', { tripId, updatedBy: req.user.id, field: 'routes' });
    res.status(201).json({ routeId: r.recordset[0].RouteID });
  } catch (err) {
    res.status(500).json({ message: 'Add route failed' });
  }
}

async function deleteRoute(req, res) {
  try {
    const pool = await poolPromise;
    const tripId = parseInt(req.params.tripId);
    const routeId = parseInt(req.params.routeId);
    const collab = await isCollaborator(pool, req.user.id, tripId);
    if (!collab || collab.Role === 'viewer') return res.status(403).json({ message: 'No edit permission' });

    const check = await pool.request()
      .input('rid', sql.Int, routeId).input('tid', sql.Int, tripId)
      .query(`SELECT RouteID FROM TripRoutes WHERE RouteID=@rid AND TripID=@tid`);
    if (!check.recordset.length) return res.status(404).json({ message: 'Route not found' });

    await pool.request().input('rid', sql.Int, routeId).query(`DELETE FROM TripRoutes WHERE RouteID=@rid`);
    if (req.io) req.io.to(`trip:${tripId}`).emit('trip_updated', { tripId, updatedBy: req.user.id, field: 'routes' });
    res.json({ message: 'Route deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete route failed' });
  }
}

// ── DELETE TRIP ───────────────────────────────────────────────────────────────

async function deleteTrip(req, res) {
  try {
    const pool = await poolPromise;
    const tripId = parseInt(req.params.tripId);
    const collab = await isCollaborator(pool, req.user.id, tripId);
    if (!collab || collab.Role !== 'owner') return res.status(403).json({ message: 'Only owner can delete' });

    await pool.request().input('tid', sql.Int, tripId)
      .query(`DELETE FROM ItineraryItems WHERE DayID IN (SELECT DayID FROM ItineraryDays WHERE TripID=@tid)`);
    await pool.request().input('tid', sql.Int, tripId).query(`DELETE FROM ItineraryDays     WHERE TripID=@tid`);
    await pool.request().input('tid', sql.Int, tripId).query(`DELETE FROM BudgetItems       WHERE TripID=@tid`);
    await pool.request().input('tid', sql.Int, tripId).query(`DELETE FROM TripBudget        WHERE TripID=@tid`);
    await pool.request().input('tid', sql.Int, tripId).query(`DELETE FROM TodoItems         WHERE TripID=@tid`);
    await pool.request().input('tid', sql.Int, tripId).query(`DELETE FROM TodoShareTokens   WHERE TripID=@tid`);
    await pool.request().input('tid', sql.Int, tripId).query(`DELETE FROM TripRoutes        WHERE TripID=@tid`);
    await pool.request().input('tid', sql.Int, tripId).query(`DELETE FROM TripCollaborators WHERE TripID=@tid`);
    await pool.request().input('tid', sql.Int, tripId).query(`DELETE FROM Trips             WHERE TripID=@tid`);
    res.json({ message: 'Trip deleted' });
  } catch (err) {
    console.error('deleteTrip:', err);
    res.status(500).json({ message: 'Delete trip failed' });
  }
}

// ─────────────────────────────────────────────────────────────────────────────




const crypto = require('crypto');

// POST /api/trips/:tripId/todos/share
// Creates (or returns existing) read-only share token for this trip's todo list
async function shareTodoList(req, res) {
  try {
    const pool = await poolPromise;
    const tripId = parseInt(req.params.tripId);
    const userId = req.user.id;

    // Check collaborator access
    const access = await pool.request()
      .input('tid', sql.Int, tripId)
      .input('uid', sql.Int, userId)
      .query(`SELECT Role FROM TripCollaborators WHERE TripID=@tid AND UserID=@uid
              UNION SELECT 'owner' WHERE EXISTS (SELECT 1 FROM Trips WHERE TripID=@tid AND UserID=@uid)`);
    if (!access.recordset.length) return res.status(403).json({ message: 'Access denied' });

    // Reuse existing unexpired token if present
    const existing = await pool.request()
      .input('tid', sql.Int, tripId)
      .input('uid', sql.Int, userId)
      .query(`SELECT Token FROM TodoShareTokens
              WHERE TripID=@tid AND UserID=@uid
              AND (ExpiresAt IS NULL OR ExpiresAt > GETDATE())
              ORDER BY CreatedAt DESC`);

    if (existing.recordset.length) {
      return res.json({ token: existing.recordset[0].Token });
    }

    // Generate new token
    const token = crypto.randomBytes(32).toString('hex');
    await pool.request()
      .input('tid', sql.Int, tripId)
      .input('uid', sql.Int, userId)
      .input('token', sql.NVarChar(64), token)
      .query(`INSERT INTO TodoShareTokens (TripID, UserID, Token) VALUES (@tid, @uid, @token)`);

    res.status(201).json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create share link' });
  }
}

// GET /api/shared/todos/:token  (public — no auth middleware)
// Returns read-only todo list for a valid share token
async function getSharedTodoList(req, res) {
  try {
    const pool = await poolPromise;
    const token = req.params.token;

    const tokenRow = await pool.request()
      .input('token', sql.NVarChar(64), token)
      .query(`SELECT t.TripID, t.ExpiresAt, tr.TripName
              FROM TodoShareTokens t
              JOIN Trips tr ON tr.TripID = t.TripID
              WHERE t.Token = @token
              AND (t.ExpiresAt IS NULL OR t.ExpiresAt > GETDATE())`);

    if (!tokenRow.recordset.length) return res.status(404).json({ message: 'Link not found or expired' });

    const { TripID, TripName } = tokenRow.recordset[0];

    const todos = await pool.request()
      .input('tid', sql.Int, TripID)
      .query(`SELECT Task, Category, IsCompleted FROM TodoItems WHERE TripID=@tid ORDER BY SortOrder, CreatedAt`);

    res.json({ tripName: TripName, todos: todos.recordset });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch shared list' });
  }
}


async function setTripHotel(req, res) {
  try {
    const pool    = await poolPromise;
    const tripId  = parseInt(req.params.tripId);
    const userId  = req.user.id;
    const collab  = await isCollaborator(pool, userId, tripId);
    if (!collab || collab.Role === 'viewer') return res.status(403).json({ message: 'No edit permission' });

    const { hotelId } = req.body; // null to clear

    await pool.request()
      .input('tid', sql.Int, tripId)
      .input('hid', sql.Int, hotelId || null)
      .query(`UPDATE Trips SET SelectedHotelID = @hid WHERE TripID = @tid`);

    if (req.io) req.io.to(`trip:${tripId}`).emit('trip_updated', { tripId, updatedBy: userId, field: 'hotel' });
    res.json({ message: 'Hotel selection saved' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save hotel selection' });
  }
}




module.exports = {
  createTrip, getMyTrips, getTripDetail, updateTrip, deleteTrip,
  addDay, addItineraryItem, deleteItineraryItem,
  upsertBudget, addBudgetItem, deleteBudgetItem,
  addTodo, toggleTodo, deleteTodo,
  getTodoTemplates,
  applyTodoTemplate,
  addRoute, deleteRoute,
  shareTodoList,
  getSharedTodoList,
  setTripHotel,
};
