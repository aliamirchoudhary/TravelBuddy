require('dotenv').config();
const { poolPromise, sql } = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

async function diagnoseLogin() {
  console.log('--- Auth Diagnostics ---');
  try {
    const pool = await poolPromise;
    console.log('✅ DB Connected');

    const email = 'luca@test.com';
    const password = 'password123';

    console.log(`Checking user: ${email}`);
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT UserID, Email, PasswordHash, DisplayName, Role, AvatarURL, IsEmailVerified FROM Users WHERE Email = @email');

    if (result.recordset.length === 0) {
      console.error('❌ User not found');
      return;
    }
    const user = result.recordset[0];
    console.log('✅ User found in DB');

    const isMatch = await bcrypt.compare(password, user.PasswordHash);
    if (!isMatch) {
      console.error('❌ Password mismatch');
      return;
    }
    console.log('✅ Password matches');

    console.log('Testing JWT signing...');
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET is missing in .env');
      return;
    }
    const token = jwt.sign(
      { id: user.UserID, email: user.Email, role: user.Role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    console.log('✅ JWT Access Token signed successfully');

    console.log('Testing Refresh Token generation...');
    const rawToken = uuidv4() + '-' + uuidv4();
    const tokenHash = await bcrypt.hash(rawToken, 10);
    console.log('✅ Refresh Token hashed successfully');

    console.log('Testing Refresh Token insertion...');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await pool.request()
      .input('uid', sql.Int, user.UserID)
      .input('hash', sql.NVarChar, tokenHash)
      .input('exp', sql.DateTime, expiresAt)
      .query('INSERT INTO RefreshTokens (UserID, TokenHash, ExpiresAt) VALUES (@uid, @hash, @exp)');
    console.log('✅ Refresh Token inserted successfully');

    console.log('--- ALL AUTH STEPS PASSED ---');
  } catch (err) {
    console.error('❌ DIAGNOSTIC FAILED');
    console.error(err);
  } finally {
    process.exit(0);
  }
}
diagnoseLogin();
