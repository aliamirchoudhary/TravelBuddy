import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const TripTimelineCard = ({ trip, index }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Dates not set';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.08 }}
      style={{ display: 'flex', gap: 14, marginBottom: 18 }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div style={{
          width: 38, height: 38, borderRadius: '50%',
          background: trip.Status === 'completed' ? 'rgba(31,138,85,0.1)' : 'rgba(232,84,26,0.12)',
          border: `2px solid ${trip.Status === 'completed' ? 'rgba(31,138,85,0.3)' : 'rgba(232,84,26,0.35)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18,
        }}>{trip.FlagEmoji || '📍'}</div>
        <div style={{ width: 2, flex: 1, background: 'var(--border)', margin: '4px 0' }} />
      </div>
      <Link to={`/trip/${trip.TripID}`} style={{ flex: 1, textDecoration: 'none' }}>
        <div style={{
          padding: '13px 16px',
          background: 'var(--surface3)', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 4,
          transition: 'all 0.2s', display: 'flex', gap: 16, alignItems: 'center'
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          <img src={trip.ThumbnailURL || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=200&h=200'} alt={trip.CityName} style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }} />
          <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14, color: 'var(--paper)', marginBottom: 3 }}>
                {trip.TripName || trip.CityName || 'Unnamed Trip'}
              </h3>
              <p style={{ color: 'var(--muted)', fontSize: 12 }}>
                {formatDate(trip.StartDate)} → {formatDate(trip.EndDate)}
              </p>
              {trip.TravelStyle && (
                <span style={{ fontSize: 10, color: 'var(--accent)', background: 'var(--accent-dim)', padding: '2px 6px', borderRadius: 4, marginTop: 4, display: 'inline-block' }}>
                  {trip.TravelStyle}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
              <span style={{
                fontSize: 10, fontFamily: 'var(--font-heading)', fontWeight: 700, letterSpacing: 0.5,
                padding: '3px 9px', borderRadius: 20,
                background: trip.Status === 'completed' ? 'rgba(31,138,85,0.1)' : 'rgba(232,84,26,0.1)',
                color: trip.Status === 'completed' ? 'var(--accent3)' : 'var(--accent)',
              }}>
                {trip.Status}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default TripTimelineCard;
