require('dotenv').config();
const { poolPromise } = require('./db');

async function checkUserFollows() {
  const pool = await poolPromise;
  const result = await pool.request().query(`
    SELECT COLUMN_NAME, DATA_TYPE 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'UserFollows'
  `);
  console.log(result.recordset);
  process.exit(0);
}

checkUserFollows();
