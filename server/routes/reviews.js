const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getReviews,
  createReview,
  markHelpful,
  getMyReviews,
} = require('../controllers/reviewController');

router.get('/mine', auth, getMyReviews);
router.get('/:entityType/:entityId', getReviews);
router.post('/', auth, createReview);
router.post('/:reviewId/helpful', auth, markHelpful);

module.exports = router;
