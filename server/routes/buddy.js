const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const {
  matchBuddies,
  sendRequest,
  respondToRequest,
  getIncomingRequests,
  getConnections,
  getProfile,
  updateProfile,
} = require('../controllers/buddyController');

// Matching
router.post('/match', auth, matchBuddies);

// Buddy requests
router.post('/request',            auth, sendRequest);
router.put('/request/:requestId',  auth, respondToRequest);
router.get('/requests',            auth, getIncomingRequests);

// Connections
router.get('/connections', auth, getConnections);

// Traveller profile
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);

module.exports = router;
