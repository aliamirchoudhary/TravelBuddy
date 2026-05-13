import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';

export default function DestinationStickyBar({ city }) {
  const navigate = useNavigate();

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'rgba(13, 26, 46, 0.9)',
      backdropFilter: 'blur(12px)',
      borderTop: '1px solid rgba(255,253,248,0.1)',
      padding: '16px 24px', 
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      boxShadow: '0 -10px 30px rgba(0,0,0,0.5)'
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '40px', height: '40px', borderRadius: '50%', 
            background: 'rgba(232,84,26,0.1)', display: 'flex', 
            alignItems: 'center', justifyContent: 'center', color: 'var(--accent)'
          }}>
            <MapPin size={20} />
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 700, color: 'var(--paper)', fontSize: '15px' }}>{city.Name}</p>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{city.CountryName}</p>
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/planner/new', { state: { prefillCity: { id: city.CityID, name: city.Name } } })}
          style={{ padding: '12px 32px' }}
        >
          Plan a Trip Here →
        </button>
      </div>
    </div>
  );
}
