const Redis = require('ioredis');

let redis;

if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 3) return null;
      return Math.min(times * 200, 2000);
    },
    lazyConnect: true,
  });

  redis.on('error', (err) => {
    console.warn('⚠️  Redis connection error (caching disabled):', err.message);
  });

  redis.on('connect', () => {
    console.log('✅ Redis connected');
  });

  // Attempt connection but don't crash if unavailable
  redis.connect().catch(() => {
    console.warn('⚠️  Redis unavailable — matching results will not be cached');
  });
} else {
  // No Redis URL configured — use a no-op cache stub
  console.warn('⚠️  REDIS_URL not set — using in-memory no-op cache');
  redis = {
    async get() { return null; },
    async set() { return 'OK'; },
    async del() { return 0; },
    pipeline() {
      return {
        incr() { return this; },
        expire() { return this; },
        async exec() { return []; }
      };
    }
  };
}

module.exports = redis;
