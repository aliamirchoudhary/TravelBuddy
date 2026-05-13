require('dotenv').config();
const { poolPromise, sql } = require('./db');

async function checkAuthSchema() {
  try {
    const pool = await poolPromise;
    const tables = ['Users', 'RefreshTokens', 'EmailVerifications', 'PasswordResets'];
    
    for (const table of tables) {
      console.log(`\n--- Schema for ${table} ---`);
      const res = await pool.request().query(`SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${table}'`);
      if (res.recordset.length === 0) {
        console.log(`Table ${table} NOT FOUND!`);
      } else {
        console.table(res.recordset);
      }
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
checkAuthSchema();
