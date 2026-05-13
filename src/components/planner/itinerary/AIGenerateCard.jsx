import { useState }         from 'react';
import useItineraryStore    from '../../../store/itineraryStore';

const STYLES    = ['Adventure', 'Cultural', 'Relaxation', 'Foodie', 'Mixed'];
const INTERESTS = ['Museums', 'Food & Drink', 'Nature', 'Nightlife', 'Shopping', 'History', 'Adventure Sports', 'Local Markets'];
const PACES     = [
  { value: 'relaxed',  label: 'Relaxed',  sub: '~2 activities/day' },
  { value: 'moderate', label: 'Moderate', sub: '~3 activities/day' },
  { value: 'packed',   label: 'Packed',   sub: '4-5 activities/day' },
];

export default function AIGenerateCard({ tripId, cityName, countryName, days }) {
  const { preferences, setPreferences, generate, isGenerating, generationError, fromCache, rateLimitInfo } = useItineraryStore();
  const [expanded, setExpanded] = useState(true);

  const toggleInterest = (interest) => {
    const curr = preferences.interests;
    const next = curr.includes(interest) ? curr.filter(i => i !== interest) : [...curr, interest];
    setPreferences({ interests: next });
  };

  const handleGenerate = () => {
    if (!cityName) return alert('Please set a destination first (Destination tab).');
    generate(tripId, cityName, countryName, days, preferences.style, preferences.interests, preferences.pace);
  };

  return (
    <div className="bento-card" style={{ 
      border: '2px solid var(--border-cyan)', 
      borderRadius: '20px', 
      overflow: 'hidden',
      background: 'rgba(129,236,255,0.03)',
      boxShadow: '0 0 40px rgba(129,236,255,0.05)'
    }}>
      {/* Header */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{ 
          background: 'var(--grad-cyan)', 
          color: 'var(--ink)', 
          padding: '20px 24px', 
          cursor: 'pointer', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}
      >
        <div>
          <p style={{ margin: 0, fontWeight: 900, fontSize: '18px', letterSpacing: '1px', fontFamily: 'var(--font-display)' }}>✨ GENERATE WITH AI</p>
          <p style={{ margin: '4px 0 0', fontSize: '12px', fontWeight: 700, opacity: 0.8 }}>
            {cityName ? `${days}-DAY ITINERARY FOR ${cityName.toUpperCase()}, ${countryName?.toUpperCase() || ''}` : 'SET A DESTINATION FIRST'}
          </p>
        </div>
        <span style={{ fontSize: '20px', fontWeight: 900 }}>{expanded ? '−' : '+'}</span>
      </div>

      {expanded && (
        <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '28px' }}>

          {/* Travel Style */}
          <div>
            <label className="tag" style={{ marginBottom: '12px' }}>Travel Style</label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {STYLES.map(s => (
                <button key={s} type="button" onClick={() => setPreferences({ style: s })}
                  className={preferences.style === s ? 'btn btn-primary' : 'btn btn-surface'}
                  style={{ padding: '8px 18px', fontSize: '13px', borderRadius: '30px' }}>
                  {s.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="tag" style={{ marginBottom: '12px' }}>Interests</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {INTERESTS.map(i => {
                const isActive = preferences.interests.includes(i);
                return (
                  <button key={i} type="button" onClick={() => toggleInterest(i)}
                    style={{
                      padding: '6px 14px', borderRadius: '12px', cursor: 'pointer', fontSize: '12px',
                      border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                      background: isActive ? 'var(--accent-dim)' : 'transparent',
                      color:      isActive ? 'var(--accent)' : 'var(--paper-muted)',
                      fontWeight: isActive ? 800 : 500,
                      transition: 'all 0.3s ease'
                    }}>
                    {i.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pace */}
          <div>
            <label className="tag" style={{ marginBottom: '12px' }}>Pace</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              {PACES.map(p => {
                const isActive = preferences.pace === p.value;
                return (
                  <button key={p.value} type="button" onClick={() => setPreferences({ pace: p.value })}
                    className="glass-bright"
                    style={{
                      flex: 1, padding: '16px', borderRadius: '16px', cursor: 'pointer', textAlign: 'center',
                      border: `2px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                      background: isActive ? 'var(--accent-dim)' : 'transparent',
                      transition: 'all 0.3s ease'
                    }}>
                    <p style={{ margin: 0, fontWeight: 900, fontSize: '14px', color: isActive ? 'var(--accent)' : 'var(--paper)', letterSpacing: '1px' }}>{p.label.toUpperCase()}</p>
                    <p style={{ margin: '4px 0 0', fontSize: '10px', color: 'var(--paper-dim)', fontWeight: 600 }}>{p.sub.toUpperCase()}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Area */}
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {generationError && (
              <div style={{ background: 'rgba(255,115,83,0.1)', border: '1px solid var(--accent2)', borderRadius: '12px', padding: '16px', color: 'var(--accent2)', fontSize: '13px', fontWeight: 600 }}>
                ⚠️ {generationError}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <p style={{ margin: 0, fontSize: '12px', color: 'var(--paper-muted)', fontWeight: 700, letterSpacing: '1px' }}>
                AI QUOTA: <span style={{ color: rateLimitInfo.remaining === 0 ? 'var(--accent2)' : 'var(--accent)' }}>{rateLimitInfo.remaining} / {rateLimitInfo.limit} REMAINING</span>
              </p>
              {fromCache && (
                <span className="badge badge-cyan" style={{ fontSize: '10px' }}>⚡ LOADED FROM CACHE</span>
              )}
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || (rateLimitInfo.remaining === 0 && !fromCache) || !cityName}
              className="btn btn-primary"
              style={{
                padding: '18px', fontSize: '16px', borderRadius: '16px', 
                boxShadow: isGenerating ? 'none' : '0 10px 20px rgba(129,236,255,0.2)'
              }}
            >
              {isGenerating
                ? "PACKING YOUR BAGS..."
                : fromCache
                ? "🔄 REGENERATE ITINERARY"
                : "✨ GENERATE ITINERARY"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
