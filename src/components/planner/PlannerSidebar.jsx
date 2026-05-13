import useTripStore from '../../store/tripStore';

const TABS = [
  { key: 'destination', icon: '🗺️',  label: 'Destination' },
  { key: 'itinerary',   icon: '📅',  label: 'Itinerary'   },
  { key: 'budget',      icon: '💰',  label: 'Budget'      },
  { key: 'routes',      icon: '🚗',  label: 'Routes'      },
  { key: 'todo',        icon: '✅',  label: 'To-Do'       },
  { key: 'utilities',   icon: '🧰',  label: 'Utilities'   },
  { key: 'buddy',       icon: '👥',  label: 'Buddy'       },
];

export default function PlannerSidebar() {
  const { activeTab, setActiveTab } = useTripStore();

  return (
    <aside className="planner-sidebar glass" style={{
      width: '240px', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', padding: '24px 12px',
      background: 'rgba(12,14,17,0.4)', flexShrink: 0,
      backdropFilter: 'blur(10px)', height: '100%'
    }}>
      <div style={{ padding: '0 12px 24px', fontSize: '10px', fontWeight: 900, letterSpacing: '2.5px', color: 'var(--paper-dim)', fontFamily: 'var(--font-label)' }}>
        PLANNER HUB
      </div>
      
      {TABS.map(tab => {
        const isActive = activeTab === tab.key;
        return (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '12px 16px', cursor: 'pointer', textAlign: 'left',
              background:  isActive ? 'var(--accent-dim)' : 'transparent',
              color:       isActive ? 'var(--accent)' : 'var(--paper-muted)',
              fontWeight:  isActive ? 700 : 500,
              borderRadius: '12px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              marginBottom: '6px',
              border: isActive ? '1px solid var(--border-cyan)' : '1px solid transparent',
              fontFamily: 'var(--font-heading)',
              position: 'relative'
            }}
            onMouseEnter={e => {
              if (!isActive) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                e.currentTarget.style.color = 'var(--paper)'
              }
            }}
            onMouseLeave={e => {
              if (!isActive) {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'var(--paper-muted)'
              }
            }}
          >
            <span style={{ 
              fontSize: '18px', 
              filter: isActive ? 'drop-shadow(0 0 8px var(--accent))' : 'none',
              transform: isActive ? 'scale(1.1)' : 'scale(1)',
              transition: 'transform 0.3s ease'
            }}>{tab.icon}</span>
            <span style={{ fontSize: '14px' }}>{tab.label}</span>
            
            {isActive && (
              <div style={{ 
                marginLeft: 'auto', 
                width: '5px', height: '5px', 
                borderRadius: '50%', 
                background: 'var(--accent)', 
                boxShadow: '0 0 10px var(--accent)' 
              }} />
            )}
          </button>
        );
      })}

      <style>{`
        @media (max-width: 900px) {
          .planner-sidebar { display: none !important; }
        }
      `}</style>
    </aside>
  );
}
