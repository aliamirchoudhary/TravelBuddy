const express = require('express');
const router = express.Router();
const controller = require('../controllers/liveMessageController');

router.get('/conversations', controller.listConversations);
router.post('/conversations', controller.createDirectConversation);
router.get('/conversations/:convId/messages', controller.getMessages);
router.post('/conversations/:convId/messages', controller.sendMessage);

module.exports = router;
