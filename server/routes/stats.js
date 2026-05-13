const express = require('express');
const router = express.Router();
const { poolPromise } = require('../db');

router.get('/platform', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        (SELECT COUNT(*) FROM Users) AS totalUsers,
        (SELECT COUNT(*) FROM Trips) AS tripsPlanned,
        (SELECT COUNT(DISTINCT Countries.CountryID) 
         FROM Trips 
         JOIN Cities ON Trips.DestinationCityID = Cities.CityID
         JOIN Countries ON Cities.CountryID = Countries.CountryID
         WHERE Trips.Status = 'completed') AS countriesCovered
    `);
    
    // Fallback if some counts are 0/null to avoid frontend errors
    const stats = result.recordset[0];
    res.json({
      totalUsers: stats.totalUsers || 0,
      tripsPlanned: stats.tripsPlanned || 0,
      countriesCovered: stats.countriesCovered || 0
    });
  } catch (err) {
    console.error('Error fetching platform stats:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
