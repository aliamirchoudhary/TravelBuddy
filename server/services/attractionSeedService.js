const axios        = require('axios');
const { sql, poolPromise } = require('../db');

/**
 * Fetch top Wikipedia articles for a city and insert as Attractions if not present.
 * Uses Wikipedia's opensearch + page summary endpoint (no API key required).
 */
async function seedAttractions(cityId, cityName) {
  try {
    // Step 1: Search for top landmarks
    const searchRes = await axios.get('https://en.wikipedia.org/w/api.php', {
      params: {
        action:   'opensearch',
        search:   `Points of interest in ${cityName}`,
        limit:    10,
        format:   'json',
        origin:   '*'
      },
      headers: { 'User-Agent': 'TravelBuddy/1.0 (contact@travelbuddy.com)' }
    });

    const titles = searchRes.data[1] || [];
    const pool   = await poolPromise;

    for (const title of titles.slice(0, 8)) {
      // Step 2: Get page summary for each result
      const summaryRes = await axios.get(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
        { headers: { 'User-Agent': 'TravelBuddy/1.0 (contact@travelbuddy.com)' } }
      ).catch(() => null);
      
      if (!summaryRes) continue;

      const { extract, thumbnail, coordinates } = summaryRes.data;
      const thumbURL = thumbnail?.source || null;
      const lat      = coordinates?.lat  || null;
      const lng      = coordinates?.lon  || null;

      // Check for duplicates by name + cityId
      const exists = await pool.request()
        .input('cid',  sql.Int,           cityId)
        .input('name', sql.NVarChar(200), title)
        .query(`SELECT COUNT(*) AS cnt FROM Attractions WHERE CityID=@cid AND Name=@name`);
      if (exists.recordset[0].cnt > 0) continue;

      // Dynamic Categorization
      const cat =
        /beach|lake|mountain|park|forest/i.test(title) ? 'nature'     :
        /museum|temple|church|castle|monument|shrine/i.test(title) ? 'history' :
        /restaurant|café|street food|market/i.test(title) ? 'food'       :
        /bar|club|nightlife/i.test(title) ? 'nightlife'  :
        'history';

      await pool.request()
        .input('cid',   sql.Int,           cityId)
        .input('name',  sql.NVarChar(200), title.slice(0, 200))
        .input('desc',  sql.NVarChar,      extract?.slice(0, 2000) || null)
        .input('cat',   sql.NVarChar(30),  cat)
        .input('thumb', sql.NVarChar(500), thumbURL)
        .input('lat',   sql.Decimal(9,6),  lat)
        .input('lng',   sql.Decimal(9,6),  lng)
        .query(`INSERT INTO Attractions (CityID, Name, Description, Category, ThumbnailURL, Latitude, Longitude)
                VALUES (@cid, @name, @desc, @cat, @thumb, @lat, @lng)`);
    }

    // Call fallback if absolutely nothing found
    const finalCount = await pool.request().input('cid', sql.Int, cityId).query('SELECT COUNT(*) as cnt FROM Attractions WHERE CityID=@cid');
    if (finalCount.recordset[0].cnt < 3) {
      await generateMockAttractions(cityId, cityName);
    }

    console.log(`[AttractionSeed] ✅ Populated attractions for ${cityName}`);
  } catch (e) {
    console.error(`[AttractionSeed] Error for ${cityName}:`, e.message);
    await generateMockAttractions(cityId, cityName);
  }
}

async function generateMockAttractions(cityId, cityName) {
  const pool = await poolPromise;
  const mocks = [
    { name: `${cityName} Old Town`, cat: 'history', desc: 'The historic heart of the city featuring architecture from past centuries.' },
    { name: `${cityName} Central Park`, cat: 'nature', desc: 'A lush green oasis perfect for afternoon walks and picnics.' },
    { name: `${cityName} Grand Museum`, cat: 'history', desc: 'Housing thousands of artifacts detailing the rich local heritage.' },
    { name: `${cityName} Food Market`, cat: 'food', desc: 'A vibrant collection of stalls offering the best local delicacies.' }
  ];

  for (const item of mocks) {
    const exists = await pool.request().input('cid', sql.Int, cityId).input('name', sql.NVarChar(200), item.name).query('SELECT COUNT(*) as cnt FROM Attractions WHERE CityID=@cid AND Name=@name');
    if (exists.recordset[0].cnt > 0) continue;

    await pool.request()
      .input('cid',   sql.Int, cityId)
      .input('name',  sql.NVarChar(200), item.name)
      .input('desc',  sql.NVarChar, item.desc)
      .input('cat',   sql.NVarChar(30), item.cat)
      .input('thumb', sql.NVarChar(500), `https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&w=400&q=80`) // Real looking placeholder
      .query(`INSERT INTO Attractions (CityID, Name, Description, Category, ThumbnailURL) VALUES (@cid, @name, @desc, @cat, @thumb)`);
  }
}

module.exports = { seedAttractions };
