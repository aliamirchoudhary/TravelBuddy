const { sql, poolPromise } = require('../db');

// GET /api/phrases?language=Japanese
async function getPhrases(req, res) {
  try {
    const pool = await poolPromise;
    const lang = String(req.query.language || '').trim();
    if (!lang) return res.status(400).json({ message: 'language query required' });

    const r = await pool.request()
      .input('lang', sql.NVarChar(50), lang)
      .query(`SELECT Category, English, Translation, SortOrder
              FROM LanguagePhrases
              WHERE Language = @lang
              ORDER BY Category, SortOrder`);

    // Group by category
    const grouped = {};
    for (const row of r.recordset) {
      if (!grouped[row.Category]) grouped[row.Category] = [];
      grouped[row.Category].push([row.English, row.Translation]);
    }

    res.json({ language: lang, phrases: grouped });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch phrases' });
  }
}

// GET /api/phrases/languages  — list all available languages
async function getLanguages(req, res) {
  try {
    const pool = await poolPromise;
    const r = await pool.request()
      .query(`SELECT DISTINCT Language FROM LanguagePhrases ORDER BY Language`);
    res.json({ languages: r.recordset.map(r => r.Language) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch languages' });
  }
}

module.exports = { getPhrases, getLanguages };

