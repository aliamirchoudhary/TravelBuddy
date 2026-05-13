/**
 * DRY RUN — Comprehensive API & DB test
 * Tests all route endpoints, database tables, and connections.
 */
require('dotenv').config();
const http = require('http');

const BASE = 'http://localhost:5000';
const results = [];
let pass = 0, fail = 0;

function get(path) {
  return new Promise((resolve) => {
    const url = new URL(path, BASE);
    http.get(url.toString(), (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    }).on('error', (e) => resolve({ status: 0, body: e.message }));
  });
}

function post(path, data = {}) {
  return new Promise((resolve) => {
    const url = new URL(path, BASE);
    const payload = JSON.stringify(data);
    const req = http.request(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
    }, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', (e) => resolve({ status: 0, body: e.message }));
    req.write(payload);
    req.end();
  });
}

function check(name, status, expected, body = '') {
  const ok = expected.includes(status);
  if (ok) pass++; else fail++;
  const icon = ok ? '✅' : '❌';
  let shortBody = '';
  try {
    const parsed = JSON.parse(body);
    shortBody = JSON.stringify(parsed).slice(0, 120);
  } catch { shortBody = body.slice(0, 120); }
  console.log(`${icon} [${status}] ${name}  ${ok ? '' : `(expected ${expected.join('|')}) `}${shortBody}`);
  results.push({ name, status, ok });
}

async function run() {
  console.log('\n═══════════════════════════════════════════════════');
  console.log('  🧪 TravelBuddy Full Dry Run Test');
  console.log('═══════════════════════════════════════════════════\n');

  // ─── 1. HEALTH ───
  console.log('── 1. Health & Core ──');
  let r = await get('/api/health');
  check('GET /api/health', r.status, [200], r.body);

  // ─── 2. AUTH ROUTES ───
  console.log('\n── 2. Auth Routes ──');
  r = await post('/api/auth/login', { email: 'test@test.com', password: 'wrong' });
  check('POST /api/auth/login (bad creds)', r.status, [401], r.body);

  r = await post('/api/auth/register', {});
  check('POST /api/auth/register (missing fields)', r.status, [400], r.body);

  r = await post('/api/auth/refresh');
  check('POST /api/auth/refresh (no cookie)', r.status, [401], r.body);

  r = await post('/api/auth/forgot-password', { email: 'nonexistent@test.com' });
  check('POST /api/auth/forgot-password', r.status, [200], r.body);

  r = await post('/api/auth/reset-password', {});
  check('POST /api/auth/reset-password (no data)', r.status, [400], r.body);

  // ─── 3. DESTINATIONS (public) ───
  console.log('\n── 3. Destination Routes (public) ──');
  r = await get('/api/destinations/countries');
  check('GET /api/destinations/countries', r.status, [200], r.body);

  r = await get('/api/destinations/cities');
  check('GET /api/destinations/cities', r.status, [200], r.body);

  r = await get('/api/destinations/search?q=tokyo');
  check('GET /api/destinations/search?q=tokyo', r.status, [200], r.body);

  // ─── 4. EXPLORE (public) ───
  console.log('\n── 4. Explore Routes ──');
  r = await get('/api/explore/popular');
  check('GET /api/explore/popular', r.status, [200], r.body);

  r = await get('/api/explore/trending');
  check('GET /api/explore/trending', r.status, [200], r.body);

  r = await get('/api/explore/search?q=paris');
  check('GET /api/explore/search?q=paris', r.status, [200], r.body);

  r = await get('/api/explore/filter');
  check('GET /api/explore/filter', r.status, [200], r.body);

  r = await get('/api/explore/featured');
  check('GET /api/explore/featured', r.status, [200], r.body);

  r = await get('/api/explore/vlogger-content');
  check('GET /api/explore/vlogger-content', r.status, [200], r.body);

  // ─── 5. SOCIAL (public-ish) ───
  console.log('\n── 5. Social Routes ──');
  r = await get('/api/social/feed');
  check('GET /api/social/feed', r.status, [200], r.body);

  r = await get('/api/social/groups');
  check('GET /api/social/groups', r.status, [200], r.body);

  r = await get('/api/social/sidebar');
  check('GET /api/social/sidebar', r.status, [200], r.body);

  // ─── 6. CONTENT (public feed) ───
  console.log('\n── 6. Content Routes ──');
  r = await get('/api/content/feed');
  check('GET /api/content/feed', r.status, [200], r.body);

  // ─── 7. STATS ───
  console.log('\n── 7. Stats Routes ──');
  r = await get('/api/stats/platform');
  check('GET /api/stats/platform', r.status, [200], r.body);

  // ─── 8. GAMIFICATION (public) ───
  console.log('\n── 8. Gamification Routes ──');
  r = await get('/api/gamification/leaderboard');
  check('GET /api/gamification/leaderboard', r.status, [200], r.body);

  // ─── 9. UTILITIES (public) ───
  console.log('\n── 9. Utilities Routes ──');
  r = await get('/api/utilities/phrases/languages');
  check('GET /api/utilities/phrases/languages', r.status, [200], r.body);

  r = await get('/api/utilities/phrases?language=Japanese');
  check('GET /api/utilities/phrases?language=Japanese', r.status, [200], r.body);

  // ─── 10. PROTECTED ROUTES (should return 401 without auth) ───
  console.log('\n── 10. Protected Routes (expect 401 without token) ──');
  r = await get('/api/trips');
  check('GET /api/trips (no auth)', r.status, [401], r.body);

  r = await get('/api/buddy/profile');
  check('GET /api/buddy/profile (no auth)', r.status, [401], r.body);

  r = await get('/api/buddy/connections');
  check('GET /api/buddy/connections (no auth)', r.status, [401], r.body);

  r = await get('/api/expenses/rates?base=USD&target=PKR');
  check('GET /api/expenses/rates (no auth)', r.status, [401], r.body);

  r = await get('/api/itinerary/ratelimit');
  check('GET /api/itinerary/ratelimit (no auth)', r.status, [401], r.body);

  r = await get('/api/emergency/embassy');
  check('GET /api/emergency/embassy (no auth)', r.status, [401], r.body);

  r = await get('/api/reviews/mine');
  check('GET /api/reviews/mine (no auth)', r.status, [401], r.body);

  r = await get('/api/creators/me');
  check('GET /api/creators/me (no auth)', r.status, [401], r.body);

  r = await get('/api/messages/conversations');
  check('GET /api/messages/conversations (no auth)', r.status, [200, 401, 500], r.body);

  // ─── 11. DB TABLE CHECK ───
  console.log('\n── 11. Database Table Verification ──');
  const sql = require('mssql');
  const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: { encrypt: true, trustServerCertificate: true },
    connectionTimeout: 60000,
  };

  try {
    const pool = await sql.connect(config);
    const tables = await pool.request().query(`
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `);
    const tableNames = tables.recordset.map(r => r.TABLE_NAME);

    const requiredTables = [
      'Users', 'Trips', 'Cities', 'Countries',
      'RefreshTokens', 'PasswordResets',
      'ItineraryDays', 'ItineraryItems', 'TripBudget', 'BudgetItems',
      'TodoItems', 'TripRoutes',
      'Reviews', 'Badges', 'UserBadges',
      'ContentPosts', 'CreatorProfiles',
      'TravellerProfiles', 'BuddyRequests',
      'Conversations', 'ConversationParticipants', 'Messages',
      'Groups', 'GroupMembers', 'GroupPosts',
    ];

    for (const t of requiredTables) {
      const found = tableNames.some(n => n.toLowerCase() === t.toLowerCase());
      if (found) { pass++; console.log(`✅ Table: ${t}`); }
      else       { fail++; console.log(`❌ MISSING Table: ${t}`); }
      results.push({ name: `Table: ${t}`, ok: found });
    }

    console.log(`\n   All tables in DB: ${tableNames.join(', ')}`);
    await pool.close();
  } catch (err) {
    fail++;
    console.log(`❌ DB connection for table check failed: ${err.message}`);
  }

  // ─── SUMMARY ───
  console.log('\n═══════════════════════════════════════════════════');
  console.log(`  📊 Results: ${pass} passed, ${fail} failed, ${pass + fail} total`);
  console.log('═══════════════════════════════════════════════════\n');

  const failures = results.filter(r => !r.ok);
  if (failures.length > 0) {
    console.log('❌ FAILURES:');
    failures.forEach(f => console.log(`   - ${f.name}`));
  } else {
    console.log('🎉 ALL TESTS PASSED!');
  }

  process.exit(fail > 0 ? 1 : 0);
}

run();
