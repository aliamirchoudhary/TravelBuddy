const sql = require('mssql');

// NOTE: Azure SQL Serverless auto-pauses after inactivity.
// The first connection after waking can take 30-60 seconds (ECONNRESET is normal during wake-up).
// We use a 90s timeout and retry logic to handle this gracefully.
const config = {
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server:   process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options:  {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  connectionTimeout: 90000,   // 90s — allows Azure Serverless DB to wake up
  requestTimeout:    90000,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

// Retry helper — Azure Serverless can reject the first 1-2 attempts while waking
async function connectWithRetry(retries = 3, delayMs = 5000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔄 DB connect attempt ${attempt}/${retries}...`);
      const pool = await new sql.ConnectionPool(config).connect();
      console.log('✅ SQL Server connected');
      return pool;
    } catch (err) {
      console.error(`❌ Attempt ${attempt} failed: [${err.code}] ${err.message}`);
      if (attempt < retries) {
        console.log(`   ⏳ Retrying in ${delayMs / 1000}s (Azure DB may be waking from auto-pause)...`);
        await new Promise(r => setTimeout(r, delayMs));
      } else {
        console.error('❌ All DB connection attempts failed. Check .env credentials and Azure portal.');
      }
    }
  }
}

const poolPromise = connectWithRetry(3, 5000);

module.exports = { sql, poolPromise };
