const axios        = require('axios');
const { sql, poolPromise } = require('../db');

async function seedCountries() {
  try {
    const { data } = await axios.get('https://restcountries.com/v3.1/all?fields=name,cca2,flag,continents,currencies,languages');
    const pool = await poolPromise;

    for (const country of data) {
      const name         = country.name.common;
      const code         = country.cca2;
      const flag         = country.flag;                            // emoji flag
      const continent    = country.continents?.[0] || null;
      const currencyKey  = Object.keys(country.currencies || {})[0] || null;
      const currencyCode = currencyKey ? currencyKey.slice(0, 3) : null;
      const currencyName = currencyKey ? country.currencies[currencyKey].name : null;
      const currencySym  = currencyKey ? country.currencies[currencyKey].symbol : null;
      
      const languageCode = Object.values(country.languages || {}).join(', ') || null;

      // Upsert — skip if already exists (re-runnable)
      await pool.request()
        .input('name', sql.NVarChar(100), name)
        .input('code', sql.Char(2),       code)
        .input('flag', sql.NVarChar(10),  flag)
        .input('cont', sql.NVarChar(50),  continent)
        .input('cur',  sql.Char(3),       currencyCode)
        .input('cname',sql.NVarChar(50),  currencyName?.slice(0, 50))
        .input('csym', sql.NVarChar(10),  currencySym?.slice(0, 10))
        .input('lang', sql.NVarChar(50),  languageCode?.slice(0, 50))
        .query(`
          IF NOT EXISTS (SELECT 1 FROM Countries WHERE CountryCode = @code)
            INSERT INTO Countries (Name, CountryCode, FlagEmoji, Continent, CurrencyCode, CurrencyName, CurrencySymbol, LanguageCode)
            VALUES (@name, @code, @flag, @cont, @cur, @cname, @csym, @lang)
          ELSE
            UPDATE Countries 
            SET CurrencyName = @cname, CurrencySymbol = @csym, CurrencyCode = @cur
            WHERE CountryCode = @code
        `);
    }
    console.log(`[CountrySeed] ✅ Countries seeded: ${data.length} records processed`);
  } catch (e) {
    console.error(`[CountrySeed] Failed:`, e.message);
  }
}

module.exports = { seedCountries };
