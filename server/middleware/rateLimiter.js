const rateLimit = require('express-rate-limit');

/**
 * Strict limiter for login/register endpoints (prevent brute force).
 * 10 requests per IP per 15 minutes.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Looser limiter for general API routes.
 * 100 requests per IP per 15 minutes.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests. Slow down.' },
});

module.exports = { authLimiter, apiLimiter };
