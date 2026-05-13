const express = require('express');
const router = express.Router();
const { getLeaderboard, getUserBadges } = require('../controllers/gamificationController');

// Optional: Could secure routes with auth, but leaderboard and badges are public profile data.
router.get('/leaderboard', getLeaderboard);
router.get('/users/:userId/badges', getUserBadges);

module.exports = router;
