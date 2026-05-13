const { sql, poolPromise }   = require('../db');
const { getRate }            = require('../services/currencyService');

// ─── Helper: verify the requesting user is a member of the trip ───────────────
async function isTripMember(pool, userId, tripId) {
  const r = await pool.request()
    .input('uid', sql.Int, userId)
    .input('tid', sql.Int, tripId)
    .query(`SELECT Role FROM TripCollaborators WHERE UserID=@uid AND TripID=@tid`);
  return r.recordset.length > 0;
}

// ─── Helper: verify a BuddyConnection exists for this trip ───────────────────
async function hasBuddyConnection(pool, userId, tripId) {
  const r = await pool.request()
    .input('uid', sql.Int, userId)
    .input('tid', sql.Int, tripId)
    .query(`SELECT ConnectionID FROM BuddyConnections 
            WHERE TripID = @tid AND (User1ID = @uid OR User2ID = @uid)`);
  return r.recordset.length > 0;
}

// POST /api/expenses
// Body: { tripId, description, totalAmount, currency, participants: [uid,...], splitType: 'equal'|'custom', customAmounts: {uid: amount} }
async function addExpense(req, res) {
  const pool = await poolPromise;
  const userId = req.user.id;
  const { tripId, description, totalAmount, currency, participants, splitType, customAmounts } = req.body;

  if (!await isTripMember(pool, userId, tripId)) {
    return res.status(403).json({ message: 'Not a member of this trip' });
  }

  // Validate custom split sums to totalAmount
  if (splitType === 'custom') {
    const sum = Object.values(customAmounts).reduce((a, b) => a + parseFloat(b), 0);
    if (Math.abs(sum - totalAmount) > 0.01)
      return res.status(400).json({ message: 'Custom amounts must sum to total amount' });
  }

  const transaction = new sql.Transaction(pool);
  try {
    await transaction.begin();
    const request = new sql.Request(transaction);

    // Insert Expenses row
    const expResult = await request
      .input('tid',   sql.Int,           tripId)
      .input('uid',   sql.Int,           userId)
      .input('desc',  sql.NVarChar(200), description)
      .input('amt',   sql.Decimal(10,2), totalAmount)
      .input('cur',   sql.Char(3),       currency)
      .query(`INSERT INTO Expenses (TripID, PaidByUserID, Description, TotalAmount, Currency)
              OUTPUT INSERTED.ExpenseID
              VALUES (@tid, @uid, @desc, @amt, @cur)`);

    const expenseId = expResult.recordset[0].ExpenseID;

    // Insert ExpenseSplits — one row per participant
    for (const participantId of participants) {
      const amountOwed = splitType === 'equal'
        ? totalAmount / participants.length
        : parseFloat(customAmounts[participantId]);

      const splitReq = new sql.Request(transaction);
      await splitReq
        .input('eid', sql.Int,           expenseId)
        .input('pid', sql.Int,           participantId)
        .input('owe', sql.Decimal(10,2), amountOwed)
        .query(`INSERT INTO ExpenseSplits (ExpenseID, UserID, AmountOwed)
                VALUES (@eid, @pid, @owe)`);
    }

    await transaction.commit();

    // Real-time push to all trip participants
    if (req.io) req.io.to(`trip:${tripId}`).emit('expense_added', { expenseId, tripId, addedBy: userId });

    const badgeService = require('../services/badgeService');
    const expenseTotal = await badgeService.getExpenseTotal(userId);
    badgeService.checkAndAward(userId, 'expense_total', expenseTotal, req.io).catch(console.error);

    res.status(201).json({ message: 'Expense added', expenseId });
  } catch (err) {
    if (transaction) await transaction.rollback();
    console.error(err);
    res.status(500).json({ message: 'Failed to add expense' });
  }
}

// GET /api/expenses/:tripId — all expenses for a trip
async function getExpenses(req, res) {
  const pool   = await poolPromise;
  const tripId = parseInt(req.params.tripId);
  const userId = req.user.id;

  try {
    if (!await isTripMember(pool, userId, tripId)) {
      return res.status(403).json({ message: 'Not a member of this trip' });
    }

    const result = await pool.request()
      .input('tid', sql.Int, tripId)
      .query(`
        SELECT
          e.ExpenseID, e.Description, e.TotalAmount, e.Currency, e.CreatedAt,
          e.PaidByUserID,
          -- Fallback if Users table isn't populated for this user
          ISNULL(u.DisplayName, 'User ' + CAST(e.PaidByUserID AS VARCHAR)) AS PaidByName,
          (
            SELECT es.UserID, es.AmountOwed, es.IsSettled, es.SettledAt,
                   ISNULL(u2.DisplayName, 'User ' + CAST(es.UserID AS VARCHAR)) AS DisplayName
            FROM ExpenseSplits es
            LEFT JOIN Users u2 ON u2.UserID = es.UserID
            WHERE es.ExpenseID = e.ExpenseID
            FOR JSON PATH
          ) AS Splits
        FROM Expenses e
        LEFT JOIN Users u ON u.UserID = e.PaidByUserID
        WHERE e.TripID = @tid
        ORDER BY e.CreatedAt DESC
      `);

    // Parse the nested JSON string SQL Server returns from FOR JSON PATH
    const expenses = result.recordset.map(row => ({
      ...row,
      Splits: row.Splits ? JSON.parse(row.Splits) : []
    }));

    res.json({ expenses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load expenses' });
  }
}

// GET /api/expenses/:tripId/settlement — "who owes whom" summary
async function getSettlement(req, res) {
  const pool   = await poolPromise;
  const tripId = parseInt(req.params.tripId);
  const userId = req.user.id;

  try {
    if (!await isTripMember(pool, userId, tripId)) {
      return res.status(403).json({ message: 'Not a member of this trip' });
    }

    // For each user: total paid - total owed back to them = net balance
    const result = await pool.request()
      .input('tid', sql.Int, tripId)
      .query(`
        SELECT
          u.UserID,
          u.DisplayName,
          ISNULL(paid.TotalPaid, 0)    AS TotalPaid,
          ISNULL(owes.TotalOwed, 0)    AS TotalOwed,
          ISNULL(paid.TotalPaid, 0) - ISNULL(owes.TotalOwed, 0) AS NetBalance
        FROM Users u
        -- JOIN TripCollaborators tc ON tc.UserID = u.UserID AND tc.TripID = @tid
        LEFT JOIN (
          SELECT PaidByUserID, SUM(TotalAmount) AS TotalPaid
          FROM Expenses WHERE TripID = @tid
          GROUP BY PaidByUserID
        ) paid ON paid.PaidByUserID = u.UserID
        LEFT JOIN (
          SELECT es.UserID, SUM(es.AmountOwed) AS TotalOwed
          FROM ExpenseSplits es
          JOIN Expenses e ON e.ExpenseID = es.ExpenseID
          WHERE e.TripID = @tid AND es.IsSettled = 0
          GROUP BY es.UserID
        ) owes ON owes.UserID = u.UserID
        WHERE (paid.TotalPaid IS NOT NULL OR owes.TotalOwed IS NOT NULL) -- only users involved in this trip's expenses
          AND EXISTS (SELECT 1 FROM TripCollaborators WHERE TripID=@tid AND UserID=u.UserID)
      `);

    res.json({ settlement: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load settlement' });
  }
}

// PUT /api/expenses/settle/:expenseId — mark all splits for an expense as settled
async function markSettled(req, res) {
  const pool      = await poolPromise;
  const userId    = req.user.id;
  const expenseId = parseInt(req.params.expenseId);

  try {
    // Verify: only the payer (PaidByUserID) or a trip member can settle
    const expRow = await pool.request()
      .input('eid', sql.Int, expenseId)
      .query(`SELECT PaidByUserID, TripID FROM Expenses WHERE ExpenseID = @eid`);
    if (!expRow.recordset.length)
      return res.status(404).json({ message: 'Expense not found' });

    const { TripID, PaidByUserID } = expRow.recordset[0];

    if (PaidByUserID !== userId && !await isTripMember(pool, userId, TripID)) {
      return res.status(403).json({ message: 'No permission to settle this expense' });
    }

    await pool.request()
      .input('eid', sql.Int, expenseId)
      .query(`UPDATE ExpenseSplits
              SET IsSettled = 1, SettledAt = GETDATE()
              WHERE ExpenseID = @eid`);

    if(req.io) req.io.to(`trip:${TripID}`).emit('expense_settled', { expenseId, settledBy: userId });

    res.json({ message: 'Marked as settled' });
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to settle' });
  }
}

// GET /api/expenses/rates?base=USD&target=PKR
async function getConversionRate(req, res) {
  try {
    const { base = 'USD', target = 'PKR' } = req.query;
    const rate = await getRate(base, target);
    res.json({ base, target, rate });
  } catch (err) {
    res.status(500).json({ message: 'Currency fetch failed' });
  }
}

module.exports = { addExpense, getExpenses, getSettlement, markSettled, getConversionRate };
