const express = require('express');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const {
  getFeed,
  getGroups,
  getSidebar,
  joinGroup,
  createGroupPost,
  trackIntent,
  followUser,
  unfollowUser,
} = require('../controllers/socialController');

const router = express.Router();

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return next();

  try {
    req.user = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
  } catch (err) {
    req.user = null;
  }
  next();
}

router.get('/feed', optionalAuth, getFeed);
router.get('/groups', getGroups);
router.get('/sidebar', optionalAuth, getSidebar);
router.post('/analytics', optionalAuth, trackIntent);
router.post('/groups/:groupId/join', auth, joinGroup);
router.post('/groups/:groupId/posts', auth, createGroupPost);

router.post('/follow', auth, followUser);
router.post('/unfollow', auth, unfollowUser);
router.post('/follow/:userId', auth, followUser);
router.post('/unfollow/:userId', auth, unfollowUser);

module.exports = router;
