const sql = require('mssql');

let cachedPool = null;

function buildConfigFromEnv() {
  if (process.env.SQL_CONNECTION_STRING) return process.env.SQL_CONNECTION_STRING;
  if (process.env.AZURE_SQL_CONNECTION_STRING) return process.env.AZURE_SQL_CONNECTION_STRING;

  const server = process.env.DB_SERVER || process.env.SQL_SERVER;
  const database = process.env.DB_NAME || process.env.SQL_DATABASE || process.env.DATABASE_NAME;
  const user = process.env.DB_USER || process.env.SQL_USER;
  const password = process.env.DB_PASSWORD || process.env.SQL_PASSWORD;

  if (!server || !database || !user || !password) {
    throw new Error('Missing SQL config. Add SQL_CONNECTION_STRING or DB_SERVER/DB_NAME/DB_USER/DB_PASSWORD to .env');
  }

  return {
    server,
    database,
    user,
    password,
    options: { encrypt: true, trustServerCertificate: true },
    pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
  };
}

async function getPool(req) {
  if (req?.app?.locals?.pool) return req.app.locals.pool;
  if (req?.app?.locals?.db) return req.app.locals.db;
  if (global.sqlPool) return global.sqlPool;
  if (cachedPool && cachedPool.connected) return cachedPool;
  cachedPool = await sql.connect(buildConfigFromEnv());
  return cachedPool;
}

module.exports = { sql, getPool };
