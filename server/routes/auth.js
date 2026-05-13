const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { poolPromise, sql } = require('../db');
const { generateAccessToken, generateRefreshToken, generateOneTimeToken } = require('../utils/tokenUtils');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');
const verifyToken = require('../middleware/auth');

// --- 1. Registration ---
router.post('/register', async (req, res) => {
  let { email, password, displayName } = req.body;

  if (!email || !password || !displayName) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  email = email.trim().toLowerCase();

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  try {
    const pool = await poolPromise;

    // Check if email already exists
    const existing = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT UserID FROM Users WHERE Email = @email');

    if (existing.recordset.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const insertResult = await pool.request()
      .input('email', sql.NVarChar, email)
      .input('hash', sql.NVarChar, passwordHash)
      .input('name', sql.NVarChar, displayName)
      .query(`
        INSERT INTO Users (Email, PasswordHash, DisplayName, IsEmailVerified)
        OUTPUT INSERTED.UserID, INSERTED.Email, INSERTED.DisplayName, INSERTED.Role
        VALUES (@email, @hash, @name, 1)
      `);

    const newUser = insertResult.recordset[0];

    res.status(201).json({
      message: 'Registration successful! You can now log in.',
      userId: newUser.UserID,
    });

  } catch (err) {
    console.error('[Register Error]', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// --- 2. Login ---
router.post('/login', async (req, res) => {
  let { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
  email = email.trim().toLowerCase();

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT UserID, Email, PasswordHash, DisplayName, Role, AvatarURL, IsEmailVerified FROM Users WHERE Email = @email');

    if (result.recordset.length === 0) return res.status(401).json({ error: 'Invalid email or password' });

    const user = result.recordset[0];
    if (!user.PasswordHash) return res.status(401).json({ error: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.PasswordHash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

    const accessToken = generateAccessToken(user);
    const { rawToken, tokenHash } = await generateRefreshToken();

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await pool.request()
      .input('uid', sql.Int, user.UserID)
      .input('hash', sql.NVarChar, tokenHash)
      .input('exp', sql.DateTime, expiresAt)
      .query('INSERT INTO RefreshTokens (UserID, TokenHash, ExpiresAt) VALUES (@uid, @hash, @exp)');

    res.cookie('refreshToken', rawToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log(`[Login] Successful login for: ${email}`);
    res.json({
      accessToken,
      user: {
        id: user.UserID,
        email: user.Email,
        displayName: user.DisplayName,
        role: user.Role,
        avatarUrl: user.AvatarURL,
      },
    });
  } catch (err) {
    console.error('[Login Error] Full Error Object:', err);
    console.error('[Login Error] Message:', err.message);
    console.error('[Login Error] Stack:', err.stack);
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

// --- 4. Refresh ---
router.post('/refresh', async (req, res) => {
  const rawToken = req.cookies.refreshToken;
  if (!rawToken) return res.status(401).json({ error: 'No refresh token' });

  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT rt.TokenID, rt.UserID, rt.TokenHash, rt.ExpiresAt, u.Email, u.DisplayName, u.Role, u.AvatarURL
      FROM RefreshTokens rt
      JOIN Users u ON rt.UserID = u.UserID
      WHERE rt.IsRevoked = 0 AND rt.ExpiresAt > GETDATE()
    `);

    let matchedToken = null;
    for (const row of result.recordset) {
      if (await bcrypt.compare(rawToken, row.TokenHash)) {
        matchedToken = row;
        break;
      }
    }

    if (!matchedToken) return res.status(401).json({ error: 'Invalid refresh token' });

    await pool.request().input('tid', sql.Int, matchedToken.TokenID).query('UPDATE RefreshTokens SET IsRevoked = 1 WHERE TokenID = @tid');

    const { rawToken: newRawToken, tokenHash: newHash } = await generateRefreshToken();
    const newExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await pool.request()
      .input('uid', sql.Int, matchedToken.UserID)
      .input('hash', sql.NVarChar, newHash)
      .input('exp', sql.DateTime, newExpiry)
      .query('INSERT INTO RefreshTokens (UserID, TokenHash, ExpiresAt) VALUES (@uid, @hash, @exp)');

    const newAccessToken = generateAccessToken({ UserID: matchedToken.UserID, Email: matchedToken.Email, Role: matchedToken.Role });

    res.cookie('refreshToken', newRawToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      accessToken: newAccessToken,
      user: {
        id: matchedToken.UserID,
        email: matchedToken.Email,
        displayName: matchedToken.DisplayName,
        role: matchedToken.Role,
        avatarUrl: matchedToken.AvatarURL,
      },
    });
  } catch (err) {
    console.error('[Refresh Error]', err);
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

// --- 5. Logout ---
router.post('/logout', verifyToken, async (req, res) => {
  try {
    const rawToken = req.cookies.refreshToken;
    if (rawToken) {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('uid', sql.Int, req.user.id)
        .query('SELECT TokenID, TokenHash FROM RefreshTokens WHERE UserID = @uid AND IsRevoked = 0 AND ExpiresAt > GETDATE()');

      for (const row of result.recordset) {
        if (await bcrypt.compare(rawToken, row.TokenHash)) {
          await pool.request().input('tid', sql.Int, row.TokenID).query('UPDATE RefreshTokens SET IsRevoked = 1 WHERE TokenID = @tid');
          break;
        }
      }
    }
    res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('[Logout Error]', err);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// --- 6. Forgot Password ---
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const pool = await poolPromise;
    const result = await pool.request().input('email', sql.NVarChar, email).query('SELECT UserID, DisplayName FROM Users WHERE Email = @email');

    if (result.recordset.length === 0) return res.json({ message: 'If that email exists, a reset link has been sent.' });

    const user = result.recordset[0];
    const resetToken = generateOneTimeToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await pool.request()
      .input('uid', sql.Int, user.UserID)
      .input('token', sql.NVarChar, resetToken)
      .input('exp', sql.DateTime, expiresAt)
      .query('INSERT INTO PasswordResets (UserID, Token, ExpiresAt) VALUES (@uid, @token, @exp)');

    await sendPasswordResetEmail(email, resetToken);
    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    console.error('[ForgotPassword Error]', err);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// --- 7. Reset Password ---
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ error: 'Token and new password are required' });
  if (newPassword.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

  try {
    const pool = await poolPromise;
    const result = await pool.request().input('token', sql.NVarChar, token).query('SELECT ResetID, UserID, ExpiresAt, UsedAt FROM PasswordResets WHERE Token = @token');

    if (result.recordset.length === 0) return res.status(400).json({ error: 'Invalid reset token' });

    const reset = result.recordset[0];
    if (reset.UsedAt !== null) return res.status(400).json({ error: 'Reset token already used' });
    if (new Date(reset.ExpiresAt) < new Date()) return res.status(400).json({ error: 'Reset token expired' });

    const newHash = await bcrypt.hash(newPassword, 12);
    const transaction = pool.transaction();
    await transaction.begin();
    try {
      await transaction.request().input('uid', sql.Int, reset.UserID).input('hash', sql.NVarChar, newHash).query('UPDATE Users SET PasswordHash = @hash WHERE UserID = @uid');
      await transaction.request().input('rid', sql.Int, reset.ResetID).query('UPDATE PasswordResets SET UsedAt = GETDATE() WHERE ResetID = @rid');
      await transaction.request().input('uid', sql.Int, reset.UserID).query('UPDATE RefreshTokens SET IsRevoked = 1 WHERE UserID = @uid');
      await transaction.commit();
    } catch (txErr) {
      await transaction.rollback();
      throw txErr;
    }
    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('[ResetPassword Error]', err);
    res.status(500).json({ error: 'Password reset failed' });
  }
});

module.exports = router;