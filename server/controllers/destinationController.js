const { sql, poolPromise }      = require('../db');
const { populateCityIfThin }    = require('../jobs/populateCity');
const redis                     = require('../redis');

// ─── Helper: cache wrapper ────────────────────────────────────────────────────
async function cachedQuery(key, ttl, queryFn) {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);
  const result = await queryFn();
  await redis.set(key, JSON.stringify(result), 'EX', ttl);
  return result;
}

// GET /api/destinations/countries
async function getCountries(req, res) {
  try {
    const countries = await cachedQuery('dest:countries', 86400, async () => {
      const pool = await poolPromise;
      const r    = await pool.request().query(
        `SELECT CountryID, Name, CountryCode, FlagEmoji, Continent, SafetyRating, CurrencyCode
         FROM Countries ORDER BY Name`
      );
      return r.recordset;
    });
    res.json({ countries });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch countries' });
  }
}

// GET /api/destinations/cities?countryId=&search=
async function getCities(req, res) {
  try {
    const { countryId, search } = req.query;
    const pool   = await poolPromise;
    const request = pool.request();

    let query = `SELECT CityID, Name, CountryID, ThumbnailURL, AvgDailyBudget, BestSeasonVisit
                 FROM Cities WHERE 1=1`;

    if (countryId) { request.input('coid', sql.Int, parseInt(countryId)); query += ' AND CountryID = @coid'; }
    if (search)    { request.input('s',    sql.NVarChar, `%${search}%`);   query += ' AND Name LIKE @s'; }

    query += ' ORDER BY Name';
    const r = await request.query(query);
    res.json({ cities: r.recordset });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch cities' });
  }
}

// POST /api/destinations/resolve
// Resolves a city name to a CityID. Creates city if doesn't exist.
async function resolveCity(req, res) {
  try {
    const { cityName, countryCode } = req.body; // e.g. "Dubai", "AE"
    if (!cityName) return res.status(400).json({ message: 'City name required' });

    const pool = await poolPromise;
    
    // 1. Check local DB
    let cityRes = await pool.request()
      .input('name', sql.NVarChar, cityName)
      .query(`SELECT CityID, Name FROM Cities WHERE Name = @name`);
    
    if (cityRes.recordset.length > 0) {
      return res.json({ city: cityRes.recordset[0] });
    }

    // 2. Resolve via Google/Mock if not found
    console.log(`[Resolve] City ${cityName} not found in DB. Auto-creating...`);
    
    // Try to find the country in our DB (seeded via countrySeedService)
    let countryRes = await pool.request()
      .input('code', sql.Char(2), countryCode || 'US')
      .query(`SELECT CountryID FROM Countries WHERE CountryCode = @code`);
    
    let countryId = countryRes.recordset[0]?.CountryID;
    
    if (!countryId) {
      // Fallback: Just pick the first country if specifically missing or default to US
      countryRes = await pool.request().query(`SELECT TOP 1 CountryID FROM Countries`);
      countryId = countryRes.recordset[0]?.CountryID || 1;
    }

    // Insert new city with basic placeholder data
    // (A real implementation would use Google Places Geocoding here to get exact Lat/Lng)
    const insertRes = await pool.request()
      .input('coid',  sql.Int, countryId)
      .input('name',  sql.NVarChar, cityName)
      .input('desc',  sql.NVarChar, `A beautiful journey through ${cityName}.`)
      .input('lat',   sql.Decimal(9,6), 0) // Placeholders
      .input('lng',   sql.Decimal(9,6), 0)
      .query(`INSERT INTO Cities (CountryID, Name, Description, Latitude, Longitude) 
              OUTPUT INSERTED.CityID, INSERTED.Name
              VALUES (@coid, @name, @desc, @lat, @lng)`);
    
    const newCity = insertRes.recordset[0];
    
    // Trigger background population job!
    populateCityIfThin(newCity.CityID, newCity.Name);

    res.json({ city: newCity });
  } catch (err) {
    console.error('[ResolveCity] Error:', err);
    res.status(500).json({ message: 'Failed to resolve city' });
  }
}

// GET /api/destinations/city/:cityId
async function getCityDetail(req, res) {
  try {
    const cityId   = parseInt(req.params.cityId);
    const pool     = await poolPromise;

    // Fetch city + parent country
    const cityRes  = await pool.request()
      .input('cid', sql.Int, cityId)
      .query(`
        SELECT c.*, co.Name AS CountryName, co.FlagEmoji, co.SafetyRating,
               co.VisaInfoText, co.CurrencyCode
        FROM Cities c
        JOIN Countries co ON co.CountryID = c.CountryID
        WHERE c.CityID = @cid
      `);
    if (!cityRes.recordset.length) return res.status(404).json({ message: 'City not found' });

    const city = cityRes.recordset[0];

    // Wait for population job to ensure first-time visitors see data immediately
    await populateCityIfThin(cityId, city.Name);

    // Fetch all place types in parallel (cached per city)
    const [hotels, restaurants, attractions] = await Promise.all([
      cachedQuery(`dest:hotels:${cityId}`, 3600, async () => {
        const r = await pool.request().input('cid', sql.Int, cityId)
          .query(`SELECT TOP 20 HotelID AS id, Name, StarRating, PricePerNightAvg,
                         ThumbnailURL, TrustScore, Latitude, Longitude, BookingURL
                  FROM Hotels WHERE CityID=@cid ORDER BY TrustScore DESC`);
        return r.recordset;
      }),
      cachedQuery(`dest:restaurants:${cityId}`, 3600, async () => {
        const r = await pool.request().input('cid', sql.Int, cityId)
          .query(`SELECT TOP 20 RestaurantID AS id, Name, Cuisine, PriceRange,
                         ThumbnailURL, TrustScore, Latitude, Longitude
                  FROM Restaurants WHERE CityID=@cid ORDER BY TrustScore DESC`);
        return r.recordset;
      }),
      cachedQuery(`dest:attractions:${cityId}`, 3600, async () => {
        const r = await pool.request().input('cid', sql.Int, cityId)
          .query(`SELECT TOP 20 AttractionID AS id, Name, Category, Description,
                         TicketPriceAvg, OpenHours, ThumbnailURL, TrustScore, Latitude, Longitude
                  FROM Attractions WHERE CityID=@cid ORDER BY TrustScore DESC`);
        return r.recordset;
      }),
    ]);

    res.json({ city, hotels, restaurants, attractions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load destination' });
  }
}

// GET /api/destinations/search?q=
async function searchDestinations(req, res) {
  try {
    const q    = req.query.q || '';
    if (q.length < 2) return res.json({ results: [] });

    const pool = await poolPromise;
    const r    = await pool.request()
      .input('q', sql.NVarChar, `${q}%`)
      .query(`
        SELECT TOP 10 CityID AS id, Name, 'city' AS type,
               (SELECT Name FROM Countries WHERE CountryID = c.CountryID) AS countryName
        FROM Cities c WHERE Name LIKE @q
        UNION
        SELECT TOP 5 CountryID AS id, Name, 'country' AS type, NULL AS countryName
        FROM Countries WHERE Name LIKE @q
        ORDER BY Name
      `);
    res.json({ results: r.recordset });
  } catch (err) {
    res.status(500).json({ message: 'Search failed' });
  }
}

// POST /api/destinations/admin/seed-countries
async function adminSeedCountries(req, res) {
  const { seedCountries } = require('../services/countrySeedService');
  try {
    await seedCountries();
    res.json({ message: 'Countries seeded successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Seeding failed', error: err.message });
  }
}

module.exports = { getCountries, getCities, resolveCity, getCityDetail, searchDestinations, adminSeedCountries };
