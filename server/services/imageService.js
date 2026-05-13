const { poolPromise, sql } = require('../db');

/**
 * Fetches an image from Unsplash.
 */
const fetchUnsplashImage = async (cityName) => {
  try {
    const response = await fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(cityName)}&orientation=landscape&client_id=${process.env.UNSPLASH_ACCESS_KEY}`
    );
    if (!response.ok) return null;
    const data = await response.json();
    return data.urls?.regular;
  } catch (err) {
    console.error('Unsplash fetch failed:', err);
    return null;
  }
};

/**
 * Fetches an image from Pexels (Fallback).
 */
const fetchPexelsImage = async (cityName) => {
  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(cityName)}&per_page=1`,
      { headers: { Authorization: process.env.PEXELS_API_KEY } }
    );
    if (!response.ok) return null;
    const data = await response.json();
    return data.photos?.[0]?.src?.large2x;
  } catch (err) {
    console.error('Pexels fetch failed:', err);
    return null;
  }
};

/**
 * Main service to get city image, caching it in DB if not present.
 */
const fetchAndCacheCityImage = async (cityId, cityName) => {
  const pool = await poolPromise;
  
  // Check if already cached
  const existing = await pool.request()
    .input('id', sql.Int, cityId)
    .query('SELECT ThumbnailURL FROM Cities WHERE CityID = @id');

  if (existing.recordset[0]?.ThumbnailURL) {
    return existing.recordset[0].ThumbnailURL;
  }

  // Not cached — call Unsplash, then Pexels
  let imageUrl = await fetchUnsplashImage(cityName);
  if (!imageUrl) {
    imageUrl = await fetchPexelsImage(cityName);
  }

  if (imageUrl) {
    // Save to DB
    await pool.request()
      .input('id', sql.Int, cityId)
      .input('url', sql.NVarChar, imageUrl)
      .query('UPDATE Cities SET ThumbnailURL = @url WHERE CityID = @id');
  } else {
    // Local placeholder as last resort
    imageUrl = '/images/placeholder-city.jpg';
  }

  return imageUrl;
};

module.exports = {
  fetchAndCacheCityImage
};
