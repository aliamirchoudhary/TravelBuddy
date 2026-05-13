const StatsRow = ({ stats }) => {
  return (
    <div style={{ background: 'var(--ink)', borderBottom: '1px solid rgba(255,253,248,0.06)' }}>
      <div className="container">
        <div style={{ display: 'flex', gap: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>
          {[
            { label: 'Countries',  value: stats.countriesVisited || 0, emoji: '🌍' },
            { label: 'Trips',      value: stats.tripsCompleted || 0,   emoji: '✈️' },
            { label: 'Buddies',    value: stats.buddiesMade || 0,      emoji: '🤝' },
            { label: 'Reviews',    value: stats.reviewsWritten || 0,   emoji: '⭐' },
          ].map(({ label, value, emoji }) => (
            <div key={label} style={{ 
              padding: '14px 24px', 
              borderRight: '1px solid rgba(255,253,248,0.06)', 
              minWidth: 110, flexShrink: 0, textAlign: 'center',
              cursor: 'pointer', transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,253,248,0.02)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--paper)', lineHeight: 1, marginBottom: 4 }}>{value}</div>
              <div style={{ color: 'rgba(247,244,238,0.35)', fontSize: 10, fontFamily: 'var(--font-heading)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>{emoji} {label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsRow;
