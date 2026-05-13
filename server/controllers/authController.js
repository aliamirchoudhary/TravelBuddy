const jwt = require('jsonwebtoken');
const { sql, poolPromise } = require('../db');

// GET /api/auth/test-users
// Returns a list of all users to populate the "Quick Select" Dev Login UI
async function getTestUsers(req, res) {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT UserID as id, Email as email, DisplayName as displayName, Avatar as avatar, Role as role 
      FROM Users
    `);
    
    // If the DB has no users yet, return a fallback array so the UI doesn't crash before seeding
    if (result.recordset.length === 0) {
      return res.json({
        users: [
          { id: 1, email: 'mock1@test.com', displayName: 'Mock User 1', avatar: '👤' }
        ]
      });
    }

    res.json({ users: result.recordset });
  } catch (err) {
    console.error('Failed to get test users:', err);
    res.status(500).json({ message: 'DB Error' });
  }
}

// POST /api/auth/login
// Dev Login: automatically authenticate any valid email passed from the Quick Select UI
async function devLogin(req, res) {
  const { email } = req.body;
  
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query(`SELECT UserID as id, Email as email, DisplayName as displayName, Avatar as avatar, Role as role FROM Users WHERE Email = @email`);
      
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Test user not found in DB. Did you run the seed script?' });
    }

    const user = result.recordset[0];
    
    // Issue token
    const token = jwt.sign(user, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
    
    res.json({ user, token });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
}

module.exports = { getTestUsers, devLogin };
