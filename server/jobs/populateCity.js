const { sql, poolPromise }    = require('../db');
const { populatePlaces }      = require('../services/placesPopulationService');
const { seedAttractions }     = require('../services/attractionSeedService');
const { populateCityMeta }    = require('../services/cityMetaService');

/**
 * Check if a city needs population and trigger data fetching if so.
 * Non-blocking — caller does NOT await this (fire and forget).
 */
async function populateCityIfThin(cityId, cityName) {
  try {
    const pool = await poolPromise;

    const counts = await pool.request()
      .input('cid', sql.Int, cityId)
      .query(`
        SELECT
          (SELECT COUNT(*) FROM Hotels      WHERE CityID = @cid) AS HotelCount,
          (SELECT COUNT(*) FROM Restaurants WHERE CityID = @cid) AS RestCount,
          (SELECT COUNT(*) FROM Attractions WHERE CityID = @cid) AS AttrCount
      `);

    const { HotelCount, RestCount, AttrCount } = counts.recordset[0];
    await populateCityMeta(cityId, cityName);

    // Thresholds: trigger fetch if below minimum
    if (HotelCount < 5)  await populatePlaces(cityId, cityName, 'hotels');
    if (RestCount  < 5)  await populatePlaces(cityId, cityName, 'restaurants');
    if (AttrCount  < 3)  await seedAttractions(cityId, cityName);

  } catch (err) {
    console.error(`populateCityIfThin failed for cityId=${cityId}:`, err.message);
  }
}

module.exports = { populateCityIfThin };
