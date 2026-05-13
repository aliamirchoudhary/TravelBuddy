const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

/**
 * Generate short-lived access token (15 minutes).
 * Payload: { id, email, role }
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.UserID, email: user.Email, role: user.Role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};

/**
 * Generate long-lived refresh token (7 days).
 * Returns BOTH the raw token (to send to client as httpOnly cookie)
 * and its bcrypt hash (to store in DB).
 */
const generateRefreshToken = async () => {
  const rawToken = uuidv4() + '-' + uuidv4();
  const tokenHash = await bcrypt.hash(rawToken, 10);
  return { rawToken, tokenHash };
};

/**
 * Generate a simple UUID token for email verification / password reset.
 */
const generateOneTimeToken = () => uuidv4();

module.exports = { generateAccessToken, generateRefreshToken, generateOneTimeToken };
