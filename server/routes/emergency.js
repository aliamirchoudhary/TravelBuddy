const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const c       = require('../controllers/emergencyController');

router.get('/embassy',                          auth, c.getEmbassyDetails);
router.get('/hospitals',                        auth, c.getNearbyHospitals);          // ?city=Tokyo
router.get('/contacts/:tripId',                 auth, c.getEmergencyContacts);
router.post('/contacts/:tripId',                auth, c.addEmergencyContact);
router.delete('/contacts/:tripId/:contactId',   auth, c.deleteEmergencyContact);

module.exports = router;
