require('dotenv').config();
const { poolPromise, sql } = require('./db');

async function checkExploreSchema() {
  try {
    const pool = await poolPromise;
    console.log('Connected to SQL Server');

    const tables = ['Countries', 'Cities'];
    for (const table of tables) {
      console.log(`\n--- Schema for ${table} ---`);
      const res = await pool.request().query(`SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${table}'`);
      if (res.recordset.length === 0) {
        console.log(`Table ${table} NOT FOUND!`);
      } else {
        console.table(res.recordset);
      }
    }
    process.exit(0);
  } catch (err) {
    console.error('Schema check failed:', err.message);
    process.exit(1);
  }
}

checkExploreSchema();
