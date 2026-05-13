require('dotenv').config();
const { poolPromise } = require('./db');

async function listTables() {
  const pool = await poolPromise;
  const result = await pool.request().query(`
    SELECT TABLE_NAME 
    FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_TYPE = 'BASE TABLE'
  `);
  console.log(result.recordset.map(r => r.TABLE_NAME));
  process.exit(0);
}

listTables();
