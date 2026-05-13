const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const { generate, saveItinerary, getItinerary, getRateLimit } = require('../controllers/itineraryController');

router.post('/generate',     auth, generate);
router.post('/save',         auth, saveItinerary);
router.get('/ratelimit',     auth, getRateLimit);
router.get('/debug/key', auth, (req, res) => {
  const key = (process.env.OPENROUTER_KEY || '').trim();
  res.json({ 
    length: key.length, 
    prefix: key.slice(0, 8), 
    suffix: key.slice(-4),
    env_source: 'server/.env'
  });
});
router.get('/:tripId',       auth, getItinerary);

module.exports = router;
