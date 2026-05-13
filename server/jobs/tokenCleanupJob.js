const cron = require('node-cron');
const { poolPromise } = require('../db');

/**
 * Token Cleanup Job
 * Runs every day at 3:00 AM — deletes expired/revoked tokens
 * to prevent the RefreshTokens, EmailVerifications, and PasswordResets
 * tables from growing indefinitely.
 */
cron.schedule('0 3 * * *', async () => {
  console.log('[TokenCleanup] Cleaning up expired tokens...');
  try {
    const pool = await poolPromise;
    
    const result1 = await pool.request().query(
      `DELETE FROM RefreshTokens WHERE ExpiresAt < GETDATE() OR IsRevoked = 1`
    );
    const result2 = await pool.request().query(
      `DELETE FROM EmailVerifications WHERE ExpiresAt < GETDATE()`
    );
    const result3 = await pool.request().query(
      `DELETE FROM PasswordResets WHERE ExpiresAt < GETDATE()`
    );

    console.log(`[TokenCleanup] Done. Removed: ${result1.rowsAffected[0]} refresh tokens, ${result2.rowsAffected[0]} email verifications, ${result3.rowsAffected[0]} password resets`);
  } catch (err) {
    console.error('[TokenCleanup] Error:', err);
  }
});

console.log('🕐 Token cleanup job scheduled (daily at 3:00 AM)');
