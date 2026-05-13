const express = require('express');
const router  = express.Router();
const c       = require('../controllers/tripController');

router.get('/todos/:token', c.getSharedTodoList);   // public, no auth

module.exports = router;
