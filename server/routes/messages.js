const express = require('express');
const jwt = require('jsonwebtoken');
const {
  getUsers,
  getConversations,
  getMessages,
  sendMessage,
  markConversationRead,
  createConversation,
  createDirectConversation,
} = require('../controllers/messageController');

const router = express.Router();

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  try {
    req.user = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
  } catch {
    req.user = null;
  }

  next();
}

router.use(optionalAuth);

// This now returns ONLY users followed by the logged-in user.
router.get('/users', getUsers);

router.get('/conversations', getConversations);
router.post('/conversations', createConversation);
router.post('/conversations/direct', createDirectConversation);
router.get('/conversations/:convId/messages', getMessages);
router.post('/send', sendMessage);
router.patch('/conversations/:convId/read', markConversationRead);

module.exports = router;
