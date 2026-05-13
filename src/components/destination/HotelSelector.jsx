import { useState, useEffect } from 'react';
import useTripStore from '../../../../store/tripStore';
import api from '../../../../services/api';

export default function HotelSelector() {
  const { trip, hotel, refreshTrip } = useTripStore();
  const [hotels,   setHotels]   = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [query,    setQuery]    = useState('');

  const cityId = trip?.DestinationCityID;

  useEffect(() => {
    if (!cityId) return;
    setLoading(true);
    api.get(`/hotels?cityId=${cityId}`)
      .then(({ data }) => setHotels(data.hotels || []))
      .catch(() => setHotels([]))
      .finally(() => setLoading(false));
  }, [cityId]);

  const select = async (hotelId) => {
    setSaving(true);
    try {
      await api.patch(`/trips/${trip.TripID}/hotel`, { hotelId });
      await refreshTrip();
    } catch {
      // silent — budget tab will show whatever is in store
    } finally {
      setSaving(false);
    }
  };

  const clear = () => select(null);

  const filtered = hotels.filter(h =>
    !query || h.Name?.toLowerCase().includes(query.toLowerCase())
  );

  if (!cityId) return null;

  return (
    <div style={{ marginTop: '20px' }}>
      <div style={{
        fontSize: '11px', fontWeight: 700, color: 'var(--paper-dim)',
        letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px',
      }}>
        🏨 Hotel for Budget Auto-fill
      </div>

      {/* Current selection */}
      {hotel && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '12px 16px', borderRadius: '12px', marginBottom: '12px',
          background: 'rgba(129,236,255,0.06)', border: '1px solid rgba(129,236,255,0.25)',
        }}>
          {hotel.ThumbnailURL && (
            <img src={hotel.ThumbnailURL} alt="" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--paper)' }}>{hotel.HotelName}</div>
            <div style={{ fontSize: '12px', color: 'var(--paper-dim)' }}>
              {'⭐'.repeat(Math.min(hotel.StarRating || 0, 5))} · ${hotel.PricePerNightAvg}/night
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            {hotel.BookingURL && (
              <a href={hotel.BookingURL} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}>
                Book ↗
              </a>
            )}
            <button onClick={clear} disabled={saving}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--paper-ghost)', fontSize: '13px' }}
              title="Remove selection">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Search + list */}
      {loading ? (
        <div style={{ fontSize: '13px', color: 'var(--paper-dim)', padding: '12px' }}>Loading hotels…</div>
      ) : hotels.length > 0 ? (
        <>
          <input
            placeholder="Search hotels…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="input-light"
            style={{ width: '100%', padding: '10px 14px', boxSizing: 'border-box', marginBottom: '10px', fontSize: '13px' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '260px', overflowY: 'auto' }}>
            {filtered.map(h => {
              const isSelected = hotel?.HotelID === h.HotelID;
              return (
                <button
                  key={h.HotelID}
                  onClick={() => select(h.HotelID)}
                  disabled={saving}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 14px', borderRadius: '10px', textAlign: 'left',
                    background: isSelected ? 'rgba(129,236,255,0.08)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isSelected ? 'var(--border-cyan)' : 'var(--border)'}`,
                    cursor: saving ? 'default' : 'pointer', transition: 'all 0.2s', width: '100%',
                  }}
                  onMouseEnter={e => { if (!saving && !isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                >
                  {h.ThumbnailURL && (
                    <img src={h.ThumbnailURL} alt="" style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--paper)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.Name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--paper-dim)' }}>
                      {'⭐'.repeat(Math.min(h.StarRating || 0, 5))} · ${h.PricePerNightAvg}/night
                    </div>
                  </div>
                  {isSelected && <span style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 800, flexShrink: 0 }}>✓ Selected</span>}
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <div style={{ fontSize: '13px', color: 'var(--paper-ghost)', padding: '12px' }}>
          No hotels found for this city. Add one via the itinerary or leave blank.
        </div>
      )}
    </div>
  );
}
