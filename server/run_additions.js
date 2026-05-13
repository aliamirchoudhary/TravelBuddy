require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { poolPromise } = require('./db');

async function runAdditions() {
  try {
    const pool = await poolPromise;
    const files = [
      'schema_feature6_additions.sql',
      'schema_feature8_additions.sql',
      'schema_feature9_additions.sql',
      'schema_feature10_additions.sql'
    ];
    for (let file of files) {
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
              console.log(`Error in batch from ${file}: ${e.message}`);
            }
          }
        }
      }
    }
    console.log('Done running additions.');
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
runAdditions();
