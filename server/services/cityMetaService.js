const axios = require('axios');
const { sql, poolPromise } = require('../db');

/**
 * Fetches city summary and main image from Wikipedia.
 */
async function populateCityMeta(cityId, cityName) {
  try {
    console.log(`[CityMeta] Fetching metadata for ${cityName}...`);
    
    // Wikipedia Rest API for page summary
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cityName)}`;
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'TravelBuddy/1.0 (contact@travelbuddy.com)' }
    }).catch(err => {
      console.warn(`[CityMeta] Wikipedia summary not found for ${cityName}:`, err.message);
      return { data: null };
    });

    if (!data) return;

    const description = data.extract ? data.extract.slice(0, 2000) : null;
    const thumbnail   = data.thumbnail ? data.thumbnail.source : null;
    const lat         = data.coordinates ? data.coordinates.lat : null;
    const lon         = data.coordinates ? data.coordinates.lon : null;

    if (!description && !thumbnail && !lat) return;

    const pool = await poolPromise;
    await pool.request()
      .input('cid',   sql.Int, cityId)
      .input('desc',  sql.NVarChar, description)
      .input('thumb', sql.NVarChar(500), thumbnail)
      .input('lat',   sql.Decimal(9,6),  lat)
      .input('lng',   sql.Decimal(9,6),  lon)
      .query(`
        UPDATE Cities 
        SET 
          Description  = COALESCE(Description, @desc),
          ThumbnailURL = COALESCE(ThumbnailURL, @thumb),
          Latitude     = COALESCE(Latitude, @lat),
          Longitude    = COALESCE(Longitude, @lng)
        WHERE CityID = @cid
      `);

    console.log(`[CityMeta] ✅ Updated ${cityName} with Wikipedia data`);
  } catch (err) {
    console.error(`[CityMeta] Error for ${cityName}:`, err.message);
  }
}

module.exports = { populateCityMeta };
