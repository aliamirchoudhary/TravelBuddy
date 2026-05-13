require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { poolPromise } = require('./db');

async function runMissingFeatures() {
  try {
    const pool = await poolPromise;
    const files = [
      'sql/feature13_reviews.sql',
      'sql/feature14_social_hub_groups.sql',
      'sql/schema_feature16_profiles.sql'
    ];
    for (let file of files) {
      console.log(`Running ${file}...`);
      const p = path.join(__dirname, file);
      if (fs.existsSync(p)) {
        let sqlContent = fs.readFileSync(p, 'utf8');
        // Remove USE TB; statements if present
        sqlContent = sqlContent.replace(/USE TB;/gi, '');
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
      } else {
        console.log(`File not found: ${p}`);
      }
    }
    console.log('Done running missing features.');
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
runMissingFeatures();
