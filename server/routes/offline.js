const express = require('express');
const { getOfflineBundle } = require('../controllers/offlineController');

const router = express.Router();

// GET /api/trips/:id/offline-bundle
// Kept under /api/trips because the bundle belongs to a trip.
router.get('/trips/:id/offline-bundle', getOfflineBundle);

module.exports = router;
