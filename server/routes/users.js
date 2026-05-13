const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const auth = require('../middleware/auth');
const { uploadAvatar, uploadCover } = require('../middleware/upload');
const {
  getProfile,
  getUserReviews,
  updateProfile,
  updatePrivacy,
  getUserGroups,
  updateAvatar,
  updateCover,
} = require('../controllers/userProfileController');

/**
 * Optional auth — attaches req.user if a valid token exists,
 * but doesn't block unauthenticated requests.
 */
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

// ── Protected routes (require auth) — MUST come before /:userId wildcard ──
router.put('/me/profile', auth, updateProfile);
router.put('/me/privacy', auth, updatePrivacy);
router.put('/me/avatar', auth, uploadAvatar.single('avatar'), updateAvatar);
router.put('/me/cover', auth, uploadCover.single('cover'), updateCover);

// ── Public routes (optional auth for owner detection) ──
router.get('/:userId/profile', optionalAuth, getProfile);
router.get('/:userId/reviews', optionalAuth, getUserReviews);
router.get('/:userId/groups', optionalAuth, getUserGroups);

module.exports = router;
