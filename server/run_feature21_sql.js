/**
 * Run Feature 21 Auth Schema Migration
 * Usage: node run_feature21_sql.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const fs = require('fs');
const { poolPromise } = require('./db');

async function run() {
  try {
    const pool = await poolPromise;
    const sqlPath = path.join(__dirname, 'sql', 'feature21_auth_schema.sql');
    const rawSQL = fs.readFileSync(sqlPath, 'utf-8');

    // Split on GO statements (SQL Server batch separator)
    const batches = rawSQL
      .split(/^\s*GO\s*$/im)
      .map(b => b.trim())
      .filter(Boolean);

    for (const batch of batches) {
      await pool.request().query(batch);
    }

    console.log('✅ Feature 21 auth schema applied successfully!');

    // Verify tables exist
    const tables = ['RefreshTokens', 'EmailVerifications', 'PasswordResets'];
    for (const t of tables) {
      const result = await pool.request().query(
        `SELECT COUNT(*) as cnt FROM sys.tables WHERE name = '${t}'`
      );
      const exists = result.recordset[0].cnt > 0;
      console.log(`   ${exists ? '✓' : '✗'} ${t}: ${exists ? 'exists' : 'MISSING'}`);
    }

    // Verify Users columns
    const cols = ['AvatarURL', 'CoverPhotoURL', 'HomeCity', 'IsEmailVerified', 'GoogleID', 'LastActiveAt'];
    for (const c of cols) {
      const result = await pool.request().query(
        `SELECT COL_LENGTH('Users', '${c}') as len`
      );
      const exists = result.recordset[0].len !== null;
      console.log(`   ${exists ? '✓' : '✗'} Users.${c}: ${exists ? 'exists' : 'MISSING'}`);
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Feature 21 schema migration failed:', err);
    process.exit(1);
  }
}

run();
