require('dotenv').config();
const { poolPromise } = require('./db');

async function fixDB() {
  try {
    const pool = await poolPromise;
    console.log('Fixing Users table...');
    
    // Safety check just in case
    await pool.request().query(`
      IF COL_LENGTH('Users', 'Role') IS NULL
      BEGIN
        ALTER TABLE Users ADD Role NVARCHAR(20) DEFAULT 'traveler';
      END
    `);
    
    console.log('✅ Missing column added!');
    process.exit(0);
  } catch (e) {
    console.error('Failed to fix DB:', e);
    process.exit(1);
  }
}

fixDB();
