require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { poolPromise } = require('./db');

async function runFeature16() {
  try {
    const pool = await poolPromise;
    const file = 'sql/schema_feature16_profiles.sql';
    console.log(`Running ${file}...`);
    const p = path.join(__dirname, file);
    if (fs.existsSync(p)) {
      const sqlContent = fs.readFileSync(p, 'utf8');
      const batches = sqlContent.split(/\bGO\b/gi);
      for (let batch of batches) {
        if (batch.trim()) {
          try {
            await pool.request().query(batch);
          } catch(e) {
            console.log(`Error in batch: ${e.message}`);
          }
        }
      }
    } else {
      console.log('File not found');
    }
    console.log('Done running feature 16 additions.');
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
runFeature16();
