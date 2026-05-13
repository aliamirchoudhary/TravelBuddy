const axios = require('axios');
const redis = require('../redis');           // ioredis instance from redis.js

/**
 * Get exchange rate from base to target currency.
 * Fetches from ExchangeRate-API once daily; serves from Redis cache otherwise.
 * @param {string} base   - e.g. 'USD'
 * @param {string} target - e.g. 'PKR'
 * @returns {number} conversion rate
 */
async function getRate(base, target) {
  if (base === target) return 1;

  try {
    const cacheKey = `fx:${base}:${target}`;
    const cached = await redis.get(cacheKey);
    if (cached) return parseFloat(cached);

    if (process.env.EXCHANGERATE_KEY) {
      const url = `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGERATE_KEY}/pair/${base}/${target}`;
      const { data } = await axios.get(url);

      if (data.result !== 'success')
        throw new Error(`Currency fetch failed: ${data['error-type']}`);

      const rate = data.conversion_rate;
      // Cache for 24 hours (86400 seconds)
      await redis.set(cacheKey, rate.toString(), 'EX', 86400);
      return rate;
    }
  } catch (err) {
    console.error('Currency service error, using fallback rates', err.message);
  }

  // Fallback dev rates if no API key or API fails
  const rates = {
    'USD:EUR': 0.92,   'EUR:USD': 1.09,
    'USD:GBP': 0.79,   'GBP:USD': 1.27,
    'USD:PKR': 278.50,  'PKR:USD': 1 / 278.50,
    'USD:JPY': 155,     'JPY:USD': 1 / 155,
    'USD:TRY': 32.2,    'TRY:USD': 1 / 32.2,
    'USD:AED': 3.67,    'AED:USD': 1 / 3.67,
    'USD:INR': 83.1,    'INR:USD': 1 / 83.1,
    'USD:CAD': 1.36,    'CAD:USD': 1 / 1.36,
    'USD:AUD': 1.53,    'AUD:USD': 1 / 1.53,
    'USD:SGD': 1.34,    'SGD:USD': 1 / 1.34,
    'USD:THB': 35.8,    'THB:USD': 1 / 35.8,
    'EUR:PKR': 301.20,  'PKR:EUR': 1 / 301.20,
    'GBP:PKR': 352,     'PKR:GBP': 1 / 352,
  };

  const direct = rates[`${base}:${target}`];
  if (direct) return direct;

  // Cross-rate via USD
  const toUsd   = rates[`${base}:USD`];
  const fromUsd = rates[`USD:${target}`];
  if (toUsd && fromUsd) return toUsd * fromUsd;

  return 1;
}

module.exports = { getRate };
