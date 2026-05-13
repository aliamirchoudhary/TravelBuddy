import { Award } from 'lucide-react';

export default function BadgeShelf({ badges, loading }) {
  if (loading) {
    return (
      <div className="badge-shelf animate-pulse">
        <div style={{ height: 24, width: 120, background: 'var(--surface3)', borderRadius: 4, marginBottom: 16 }}></div>
        <div style={{ display: 'flex', gap: 16 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ width: 80, height: 80, background: 'var(--surface3)', borderRadius: 12 }}></div>
          ))}
        </div>
      </div>
    );
  }

  if (!badges || badges.length === 0) {
    return (
      <div className="badge-shelf">
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Award size={20} className="text-accent" /> Badges
        </h3>
        <p style={{ color: 'var(--paper-dim)', fontSize: 13 }}>No badges earned yet. Start your journey to unlock them!</p>
      </div>
    );
  }

  return (
    <div className="badge-shelf">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'between', marginBottom: 20 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Award size={20} className="text-accent" /> Badge Shelf
        </h3>
        <span style={{ 
          fontSize: 11, 
          fontWeight: 700, 
          color: 'var(--accent)', 
          background: 'var(--accent-dim)', 
          padding: '2px 10px', 
          borderRadius: 20,
          marginLeft: 'auto'
        }}>
          {badges.length} Earned
        </span>
      </div>

      <div style={{ display: 'flex', gap: 20, overflowX: 'auto', paddingBottom: 10 }}>
        {badges.map((badge) => (
          <div 
            key={badge.BadgeID} 
            className="badge-item"
            title={`${badge.Name}: ${badge.Description}`}
          >
            <div className="badge-icon-wrapper">
              <img 
                src={badge.IconURL || '/badges/default-badge.png'} 
                alt={badge.Name}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                onError={(e) => { e.target.src = 'https://cdn-icons-png.flaticon.com/512/3135/3135692.png' }}
              />
            </div>
            <span className="badge-label">{badge.Name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
