const express = require('express');
const auth = require('../middleware/auth');
const {
  registerCreator,
  getMe,
  getCreatorById,
  getMyContent,
  getMyAnalytics,
  getMyProducts,
  createProduct,
  getMyCollabs,
  createCollabRequest,
  respondToCollab,
  generateTravelLog,
} = require('../controllers/creatorController');

const router = express.Router();

router.post('/register', auth, registerCreator);
router.get('/me', auth, getMe);
router.get('/me/content', auth, getMyContent);
router.get('/me/analytics', auth, getMyAnalytics);
router.get('/me/products', auth, getMyProducts);
router.post('/me/products', auth, createProduct);
router.get('/me/collabs', auth, getMyCollabs);
router.post('/me/collabs', auth, createCollabRequest);
router.patch('/me/collabs/:collabId', auth, respondToCollab);
router.post('/trips/:tripId/travel-log', auth, generateTravelLog);
router.get('/:id', getCreatorById);

module.exports = router;
