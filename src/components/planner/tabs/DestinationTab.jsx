import { useState }  from 'react';
import useTripStore  from '../../../store/tripStore';
import api           from '../../../services/api';

export default function DestinationTab() {
  const { trip, setTripField, refreshTrip } = useTripStore();
  const [query, setQuery]   = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const search = async (q) => {
    setQuery(q);
    if (q.length < 2) return setResults([]);
    setSearching(true);
    try {
      const { data } = await api.get(`/destinations/search?q=${q}`);
      setResults(data.results);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const selectCity = async (city) => {
    setResults([]);
    setQuery('');
    await api.patch(`/trips/${trip.TripID}`, { destinationCityId: city.id });
    refreshTrip();
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', animation: 'fadeUp 0.6s ease' }}>
      <div style={{ marginBottom: '40px' }}>
        <h3 className="display-heading" style={{ fontSize: '32px', marginBottom: '8px' }}>
          Where to, <span className="text-gradient">Explorer?</span>
        </h3>
        <p style={{ color: 'var(--paper-muted)', fontSize: '15px' }}>Define your destination and travel window.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {/* CURRENT DESTINATION */}
        <div className="bento-card" style={{ padding: '32px', gridColumn: 'span 2' }}>
          <div className="tag" style={{ marginBottom: '16px' }}>Current Destination</div>
          {trip.CityName ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ fontSize: '48px' }}>{trip.FlagEmoji}</div>
              <div>
                <h4 style={{ margin: 0, fontSize: '28px', fontWeight: 900, color: 'var(--paper)', fontFamily: 'var(--font-display)' }}>
                  {trip.CityName.toUpperCase()}
                </h4>
                <p style={{ margin: '4px 0 0', color: 'var(--accent)', fontWeight: 700, fontSize: '13px', letterSpacing: '1px' }}>
                  {trip.CountryName.toUpperCase()}
                </p>
              </div>
            </div>
          ) : (
            <div style={{ padding: '20px', border: '1px dashed var(--border)', borderRadius: '12px', textAlign: 'center', color: 'var(--paper-dim)' }}>
              No destination selected yet. Use the search below.
            </div>
          )}
        </div>

        {/* SEARCH BOX */}
        <div className="bento-card" style={{ padding: '32px', gridColumn: 'span 2' }}>
          <div className="tag" style={{ marginBottom: '16px' }}>Change Location</div>
          <div style={{ position: 'relative' }}>
            <input
              placeholder="Search cities (e.g. Kyoto, New York)..."
              value={query}
              onChange={e => search(e.target.value)}
              className="input-light"
              style={{ width: '100%', padding: '16px 20px', fontSize: '16px', borderRadius: '14px' }}
            />
            
            {/* Results dropdown */}
            {(results.length > 0 || searching) && (
              <div className="glass" style={{ 
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, 
                borderRadius: '14px', marginTop: '12px', overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)', border: '1px solid var(--border-cyan)'
              }}>
                {searching && <div style={{ padding: '16px', textAlign: 'center', fontSize: '14px', color: 'var(--paper-dim)' }}>Scanning globe...</div>}
                {results.map(r => (
                  <button key={`${r.type}-${r.id}`} onClick={() => selectCity(r)}
                    style={{ 
                      display: 'block', width: '100%', padding: '14px 20px', textAlign: 'left', 
                      border: 'none', background: 'transparent', cursor: 'pointer', 
                      borderBottom: '1px solid var(--paper-ghost)', fontSize: '15px', color: 'var(--paper)',
                      transition: 'background 0.2s' 
                    }}
                    onMouseEnter={e => e.target.style.background = 'var(--accent-dim)'}
                    onMouseLeave={e => e.target.style.background = 'transparent'}
                  >
                    <span style={{ marginRight: '10px' }}>{r.type === 'city' ? '🏙️' : '🌍'}</span>
                    <span style={{ fontWeight: 600 }}>{r.name}</span>
                    {r.countryName && <span style={{ color: 'var(--paper-dim)', fontSize: '13px' }}>, {r.countryName}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* DATE PICKERS */}
        <div className="bento-card" style={{ padding: '32px' }}>
          <div className="tag" style={{ marginBottom: '16px' }}>Arrival</div>
          <input type="date" value={trip.StartDate ? trip.StartDate.split('T')[0] : ''}
            onChange={e => { setTripField('StartDate', e.target.value); api.patch(`/trips/${trip.TripID}`, { startDate: e.target.value }); }}
            className="input-light"
            style={{ width: '100%', padding: '14px', borderRadius: '12px', fontSize: '15px' }}
          />
        </div>

        <div className="bento-card" style={{ padding: '32px' }}>
          <div className="tag" style={{ marginBottom: '16px' }}>Departure</div>
          <input type="date" value={trip.EndDate ? trip.EndDate.split('T')[0] : ''}
            onChange={e => { setTripField('EndDate', e.target.value); api.patch(`/trips/${trip.TripID}`, { endDate: e.target.value }); }}
            className="input-light"
            style={{ width: '100%', padding: '14px', borderRadius: '12px', fontSize: '15px' }}
          />
        </div>
      </div>
    </div>
  );
}
