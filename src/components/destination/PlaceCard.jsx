import { useNavigate } from 'react-router-dom';

const PRICE_LABELS = { 1: '$', 2: '$$', 3: '$$$', 4: '$$$$' };

export default function PlaceCard({ item, type }) {
  const navigate = useNavigate();

  const stars     = Math.round(item.TrustScore || 0);
  const fallbackImg = '/fallback-place.jpg';

  const priceDisplay =
    type === 'hotel'      ? (item.PricePerNightAvg ? `$${item.PricePerNightAvg}/night` : null)
  : type === 'restaurant' ? PRICE_LABELS[item.PriceRange] || null
  : type === 'attraction' ? (item.TicketPriceAvg   ? `$${item.TicketPriceAvg} avg`    : 'Free')
  : null;

  const handleAddToTrip = () => {
    // Pass place data to Trip Planner via URL state
    navigate('/trip/new', { state: { prefillPlace: { type, id: item.id, name: item.Name } } });
  };

  return (
    <div style={{
      background: 'var(--surface2)', border: '1px solid rgba(255,253,248,0.07)', 
      borderRadius: 'var(--r-md)', overflow: 'hidden', display: 'flex', flexDirection: 'column',
      transition: 'box-shadow 0.2s',
    }}
    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)'}
    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      {/* Thumbnail */}
      <img
        src={item.ThumbnailURL || fallbackImg}
        alt={item.Name}
        style={{ width: '100%', height: '180px', objectFit: 'cover' }}
        onError={e => { e.target.src = fallbackImg; }}
      />

      {/* Body */}
      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h4 style={{ margin: 0, fontSize: '16px', fontFamily: 'var(--font-heading)', color: 'var(--paper)' }}>{item.Name}</h4>

        {/* Category badge — attractions */}
        {type === 'attraction' && item.Category && (
          <span style={{
            fontSize: '11px', padding: '3px 10px', borderRadius: '12px',
            background: 'rgba(232,84,26,0.1)', color: 'var(--accent)', textTransform: 'capitalize', alignSelf: 'flex-start',
            fontWeight: 600
          }}>
            {item.Category}
          </span>
        )}

        {/* Cuisine — restaurants */}
        {type === 'restaurant' && item.Cuisine && (
          <span style={{ fontSize: '13px', color: 'var(--muted)' }}>{item.Cuisine}</span>
        )}

        {/* Stars + Price */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
          <span style={{ fontSize: '14px', color: '#c9a227' }}>
            {'★'.repeat(stars)}<span style={{ color: 'rgba(247,244,238,0.2)' }}>{'☆'.repeat(5 - stars)}</span>
            <span style={{ fontSize: '12px', color: 'var(--muted)', marginLeft: '6px' }}>
              ({item.TrustScore?.toFixed(1) || '–'})
            </span>
          </span>
          {priceDisplay && (
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent)' }}>{priceDisplay}</span>
          )}
        </div>

        {/* Open Hours — attractions */}
        {type === 'attraction' && item.OpenHours && (
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted)' }}>🕐 {item.OpenHours}</p>
        )}

        {/* Booking link — hotels */}
        {type === 'hotel' && item.BookingURL && (
          <a href={item.BookingURL} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: '12px', color: 'var(--accent)', textDecoration: 'none' }}>
            Book Room ↗
          </a>
        )}
      </div>

      {/* Add to Trip CTA */}
      <div style={{ padding: '0 16px 16px' }}>
        <button onClick={handleAddToTrip} className="btn btn-outline" style={{ width: '100%' }}>
          + Add to Trip
        </button>
      </div>
    </div>
  );
}
