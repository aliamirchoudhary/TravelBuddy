import useTripStore from '../../store/tripStore';

const TABS = [
  { key: 'destination', icon: '🗺️' },
  { key: 'itinerary',   icon: '📅' },
  { key: 'budget',      icon: '💰' },
  { key: 'routes',      icon: '🚗' },
  { key: 'todo',        icon: '✅' },
  { key: 'utilities',   icon: '🧰' },
  { key: 'buddy',       icon: '👥' },
];

export default function PlannerBottomNav() {
  const { activeTab, setActiveTab } = useTripStore();

  return (
    <nav className="planner-bottom-nav glass" style={{
      display: 'flex', justifyContent: 'space-around', alignItems: 'center',
      padding: '12px 0', borderTop: '1px solid var(--border)',
      background: 'rgba(12,14,17,0.85)', flexShrink: 0,
      backdropFilter: 'blur(15px)',
      position: 'relative', zIndex: 100
    }}>
      {TABS.map(tab => {
        const isActive = activeTab === tab.key;
        return (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              border: 'none', background: 'none', cursor: 'pointer', padding: '8px',
              color: isActive ? 'var(--accent)' : 'var(--paper-dim)',
              fontSize: '22px',
              transition: 'all 0.3s ease',
              transform: isActive ? 'scale(1.2) translateY(-4px)' : 'scale(1)',
              filter: isActive ? 'drop-shadow(0 0 8px var(--accent-glow))' : 'none'
            }}>
            {tab.icon}
            {isActive && (
              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent)', marginTop: '4px' }} />
            )}
          </button>
        );
      })}

      <style>{`
        @media (min-width: 901px) {
          .planner-bottom-nav { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
