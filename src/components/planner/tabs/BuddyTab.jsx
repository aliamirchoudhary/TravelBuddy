import { useNavigate } from 'react-router-dom';
import useTripStore    from '../../../store/tripStore';

export default function BuddyTab() {
  const navigate = useNavigate();
  const { trip, collaborators } = useTripStore();
  const buddies = (collaborators || []).filter(c => c.Role === 'buddy');

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', animation: 'fadeUp 0.8s ease' }}>
      <div style={{ marginBottom: '32px' }}>
        <h3 className="display-heading" style={{ fontSize: '32px', marginBottom: '8px' }}>
          Travel <span className="text-gradient">Buddies</span>
        </h3>
        <p style={{ color: 'var(--paper-muted)', fontSize: '15px' }}>Team up with fellow travelers for an unforgettable trip.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        {/* CONNECTED BUDDIES */}
        <div className="bento-card" style={{ padding: '32px' }}>
          <div className="tag" style={{ marginBottom: '20px' }}>Your Squad</div>
          
          {buddies.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {buddies.map(b => (
                <div key={b.UserID} style={{ 
                  display: 'flex', alignItems: 'center', gap: '16px', 
                  padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px' 
                }}>
                  <img src={b.AvatarURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + b.DisplayName} alt={b.DisplayName}
                    style={{ width: '50px', height: '50px', borderRadius: '50%', border: '2px solid var(--accent)' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: '16px', color: 'var(--paper)' }}>{b.DisplayName.toUpperCase()}</div>
                    <div className="badge badge-cyan" style={{ fontSize: '9px', marginTop: '4px' }}>ACTIVE BUDDY</div>
                  </div>
                  <div style={{ color: 'var(--accent3)', fontSize: '12px', fontWeight: 700 }}>ONLINE</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: '20px' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>🤝</div>
              <p style={{ color: 'var(--paper-dim)', fontSize: '14px', marginBottom: '20px' }}>No buddies have joined this trip yet.</p>
              <button 
                onClick={() => navigate('/buddy')}
                className="btn btn-surface"
              >
                BROWSE BUDDIES
              </button>
            </div>
          )}
        </div>

        {/* FIND BUDDY CALL TO ACTION */}
        <div className="bento-card" style={{ 
          padding: '40px', textAlign: 'center', 
          background: 'var(--grad-cyan)', color: 'var(--ink)' 
        }}>
          <h4 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: 900 }}>Multiply the Fun</h4>
          <p style={{ margin: '0 0 24px', fontSize: '15px', fontWeight: 600, opacity: 0.8 }}>
            Find travelers heading to {trip.CityName || 'the same destination'} at the same time.
          </p>
          <button 
            onClick={() => navigate('/buddy', { state: { prefillCity: trip.CityName } })} 
            className="btn" 
            style={{ background: 'var(--ink)', color: 'var(--paper)', padding: '16px 40px', fontSize: '14px' }}
          >
            FIND A TRAVEL BUDDY →
          </button>
        </div>
      </div>
    </div>
  );
}
