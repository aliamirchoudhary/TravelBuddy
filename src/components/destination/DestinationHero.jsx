export default function DestinationHero({ city }) {
  // Unsplash source URL as fallback
  const heroImg = city.ThumbnailURL || 
    'https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&w=1200&q=80'; // Scenic travel placeholder

  const safetyColor = city.SafetyRating >= 4 ? 'var(--accent)'
                    : city.SafetyRating >= 3 ? '#ca8a04'
                    : '#dc2626';

  return (
    <div style={{ position: 'relative', width: '100%', height: '420px', overflow: 'hidden' }}>
      {/* Hero image */}
      <img
        src={heroImg}
        alt={city.Name}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        onError={e => { e.target.src = '/fallback-city.jpg'; }}
      />

      {/* Cinematic dark cyan gradient overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, var(--ink) 0%, rgba(13, 26, 46, 0.4) 55%, transparent 100%)'
      }} />

      {/* City metadata */}
      <div className="container" style={{ position: 'absolute', bottom: '34px', left: 0, right: 0, color: 'var(--paper)' }}>
        <h1 style={{ margin: 0, fontSize: 'clamp(38px, 6vw, 54px)', fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', lineHeight: 1 }}>
          {city.FlagEmoji} {city.Name}
        </h1>
        <p style={{ margin: '8px 0 0', fontSize: '18px', opacity: 0.8, fontFamily: 'var(--font-heading)' }}>{city.CountryName}</p>

        <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
          {/* Safety badge */}
          <span style={{
            background: safetyColor + '20', color: safetyColor, border: `1px solid ${safetyColor}50`,
            padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-heading)'
          }}>
            Safety {city.SafetyRating}/5
          </span>

          {/* Avg daily budget */}
          {city.AvgDailyBudget && (
            <span style={{
              background: 'rgba(255,253,248,0.08)', color: 'var(--paper)', border: '1px solid rgba(255,253,248,0.15)',
              padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600
            }}>
              ~${city.AvgDailyBudget}/day
            </span>
          )}

          {/* Best season */}
          {city.BestSeasonVisit && (
            <span style={{
              background: 'rgba(255,253,248,0.08)', color: 'var(--paper)', border: '1px solid rgba(255,253,248,0.15)',
              padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600
            }}>
              Best: {city.BestSeasonVisit}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
