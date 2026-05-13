const express = require('express');
const router  = express.Router();
// We temporarily comment out auth so we don't block the testing of GET requests before auth is fully hooked in, but admin is protected
const auth    = require('../middleware/auth');
const {
  getCountries,
  getCities,
  getCityDetail,
  searchDestinations,
  resolveCity,
  adminSeedCountries
} = require('../controllers/destinationController');

router.get('/countries',               getCountries);          // public
router.get('/cities',                  getCities);             // public
router.get('/city/:cityId',            getCityDetail);         // public
router.get('/search',                  searchDestinations);    // public
router.post('/resolve',                resolveCity);           // public (auto-creation unit)
router.post('/admin/seed-countries',   auth, adminSeedCountries); // admin only

module.exports = router;
