require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { poolPromise } = require('./db');

async function runSchema() {
  try {
    console.log('Connecting to database...');
    const pool = await poolPromise;

    console.log('Reading schema.sql...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sqlContent = fs.readFileSync(schemaPath, 'utf8');

    // Split by GO since mssql driver doesn't support batch execution with GO
    const batches = sqlContent.split(/\bGO\b/gi);

    for (let batch of batches) {
      if (batch.trim()) {
        await pool.request().query(batch);
      }
    }

    console.log('✅ schema.sql executed successfully! All tables created.');
    process.exit(0);
  } catch (e) {
    console.error('Failed to execute schema:', e);
    process.exit(1);
  }
}

runSchema();
