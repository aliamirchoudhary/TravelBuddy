const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const {
  addExpense,
  getExpenses,
  getSettlement,
  markSettled,
  getConversionRate
} = require('../controllers/expenseController');

router.post('/',                        auth, addExpense);
router.get('/rates',                    auth, getConversionRate);   // ?base=USD&target=PKR - note: mount before dynamic params
router.get('/:tripId',                  auth, getExpenses);
router.get('/:tripId/settlement',       auth, getSettlement);
router.put('/settle/:expenseId',        auth, markSettled);

module.exports = router;
