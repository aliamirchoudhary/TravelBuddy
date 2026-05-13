const express = require('express');
const router  = express.Router();
const c       = require('../controllers/utilitiesController');

router.get('/phrases',           c.getPhrases);
router.get('/phrases/languages', c.getLanguages);

module.exports = router;
