const express = require('express');
const auth = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const {
  uploadContent,
  getPublicFeed,
  incrementView,
  toggleLike,
  getComments,
  addComment,
} = require('../controllers/contentController');

const router = express.Router();

router.get('/feed', getPublicFeed);
router.post('/upload', auth, upload.single('media'), uploadContent);
router.post('/:postId/view', incrementView);
router.post('/:postId/like', auth, toggleLike);
router.get('/:postId/comments', getComments);
router.post('/:postId/comments', auth, addComment);

module.exports = router;
