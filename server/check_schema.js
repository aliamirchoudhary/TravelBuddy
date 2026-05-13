const { poolPromise, sql } = require('./db');
require('dotenv').config({ path: './server/.env' });

async function check() {
  try {
    const pool = await poolPromise;
    const res = await pool.request().query("SELECT COLUMN_NAME, IS_NULLABLE, COLUMN_DEFAULT FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'ItineraryDays'");
    console.log(JSON.stringify(res.recordset, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
check();
