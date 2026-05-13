const axios = require('axios');
const crypto = require('crypto');
const redis  = require('../redis');

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL          = 'google/gemma-7b-it:free';

/**
 * Build the structured prompt for the AI model.
 */
function buildPrompt(cityName, countryName, days, style, interests, pace) {
  const interestList = interests.join(', ') || 'general sightseeing';

  const system = `You are a professional travel planner. You MUST respond ONLY with a valid JSON object. No prose, no markdown, no explanation — raw JSON only.`;

  const user = `Generate a ${days}-day travel itinerary for ${cityName}, ${countryName}.
Travel style: ${style}.
Interests: ${interestList}.
Pace: ${pace} (relaxed = 2 activities/day, moderate = 3 activities/day, packed = 4-5 activities/day).

Respond with EXACTLY this JSON structure:
{
  "days": [
    {
      "day": 1,
      "activities": [
        {
          "timeSlot": "morning",
          "title": "Activity name",
          "description": "Brief description (2 sentences max)",
          "locationName": "Specific place name",
          "durationMinutes": 90,
          "estimatedCost": 15.00
        }
      ]
    }
  ]
}

Rules:
- timeSlot must be exactly one of: "morning", "afternoon", "evening"
- estimatedCost is in USD, use 0 for free activities
- durationMinutes must be a number
- Do not include any text outside the JSON object`;

  return { system, user };
}

/**
 * Call OpenRouter API and return parsed JSON itinerary.
 */
async function generateItinerary(params) {
  const { cityName, countryName, days, style, interests, pace } = params;

  // 1. Cache check
  const cacheKey = buildCacheKey(params);
  const cached   = await redis.get(cacheKey);
  if (cached) return { ...JSON.parse(cached), fromCache: true };

  // 2. First attempt
  const { system, user } = buildPrompt(cityName, countryName, days, style, interests, pace);
  let parsed = await callOpenRouter(system, user);

  // 3. Retry once on failure
  if (!parsed) {
    const stricterUser = user + '\n\nCRITICAL: Your ENTIRE response must be a single JSON object starting with { and ending with }. Nothing else.';
    parsed = await callOpenRouter(system, stricterUser);
  }

  if (!parsed) {
    throw new Error('AI_GENERATION_FAILED');
  }

  // 4. Validate structure
  parsed = validateAndClean(parsed, days);

  // 5. Cache for 48 hours
  await redis.set(cacheKey, JSON.stringify(parsed), 'EX', 172800);

  return parsed;
}

async function callOpenRouter(system, user) {
  try {
    const key = (process.env.OPENROUTER_KEY || '').trim();
    if (!key) {
      console.error('❌ CRITICAL: OPENROUTER_KEY is missing in process.env');
      return null;
    }
    console.log('Sending request to OpenRouter with key length:', key.length);
    const response = await axios.post(
      OPENROUTER_URL,
      {
        model: MODEL,
        messages: [
          { role: 'system', content: system },
          { role: 'user',   content: user   },
        ],
        temperature: 0.7,
        max_tokens:  2000,
      },
      {
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type':  'application/json',
          'HTTP-Referer':  'http://localhost:5173',
          'X-Title':       'TravelBuddy',
        },
        timeout: 30000,
      }
    );

    const raw = response.data.choices?.[0]?.message?.content || '';
    return safeParseJSON(raw);
  } catch (err) {
    console.error('OpenRouter call failed:', err.message);
    if (err.response) {
      console.error('Response Status:', err.response.status);
      console.error('Response Data:', JSON.stringify(err.response.data));
    }
    return null;
  }
}

function safeParseJSON(raw) {
  try {
    let clean = raw.trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/,      '')
      .replace(/\s*```$/,      '');

    const start = clean.indexOf('{');
    const end   = clean.lastIndexOf('}');
    if (start === -1 || end === -1) return null;

    clean = clean.slice(start, end + 1);
    return JSON.parse(clean);
  } catch {
    return null;
  }
}

function validateAndClean(parsed, expectedDays) {
  if (!parsed.days || !Array.isArray(parsed.days)) {
    throw new Error('AI_INVALID_STRUCTURE');
  }

  const VALID_SLOTS = new Set(['morning', 'afternoon', 'evening']);

  return {
    days: parsed.days.slice(0, expectedDays).map((d, i) => ({
      day: d.day || i + 1,
      activities: (d.activities || []).map((a, j) => ({
        timeSlot:        VALID_SLOTS.has(a.timeSlot) ? a.timeSlot : 'morning',
        title:           String(a.title         || 'Activity').slice(0, 200),
        description:     String(a.description   || '').slice(0, 1000),
        locationName:    String(a.locationName  || '').slice(0, 200),
        durationMinutes: parseInt(a.durationMinutes) || 60,
        estimatedCost:   parseFloat(a.estimatedCost) || 0,
        sortOrder:       j,
      })),
    })),
  };
}

function buildCacheKey({ cityName, countryName, days, style, interests, pace }) {
  const raw = `${cityName}:${countryName}:${days}:${style}:${[...interests].sort().join(',')}:${pace}`;
  return `ai:itin:${crypto.createHash('md5').update(raw).digest('hex')}`;
}

module.exports = { generateItinerary };
