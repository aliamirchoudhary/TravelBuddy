import { useEffect } from 'react';
import useBadgeStore from '../../store/badgeStore';

export default function BadgeAwardModal() {
  const { activeBadge, hideBadge } = useBadgeStore();

  useEffect(() => {
    if (activeBadge) {
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        hideBadge();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [activeBadge, hideBadge]);

  if (!activeBadge) return null;

  // The socket event sends { badge: { ... }, earnedAt: ... }
  const badge = activeBadge.badge;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20
    }}>
      {/* Backdrop */}
      <div 
        className="animate-fade-in"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)'
        }}
        onClick={hideBadge}
      />

      {/* Modal Content */}
      <div 
        className="animate-pop-in"
        style={{
          position: 'relative',
          background: 'var(--surface)',
          border: '1px solid var(--accent)',
          borderRadius: 32,
          padding: 40,
          maxWidth: 400,
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 0 50px rgba(129, 236, 255, 0.25)'
        }}
      >
        
        {/* Glow effect behind icon */}
        <div style={{
          position: 'absolute',
          top: 60,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 120,
          height: 120,
          background: 'rgba(129, 236, 255, 0.15)',
          borderRadius: '50%',
          filter: 'blur(30px)'
        }} />

        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 32,
          fontWeight: 900,
          marginBottom: 24,
          background: 'var(--grad-cyan)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }} className="animate-slide-up">
          Badge Unlocked!
        </h2>

        <div style={{
          position: 'relative',
          width: 120,
          height: 120,
          margin: '0 auto 24px',
          transition: 'transform 0.4s'
        }}>
          <img 
            src={badge.iconURL || '/badges/default-badge.png'} 
            alt={badge.name}
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 10px rgba(129, 236, 255, 0.4))'
            }}
            onError={(e) => { e.target.src = 'https://cdn-icons-png.flaticon.com/512/3135/3135692.png' }}
          />
        </div>

        <h3 style={{ fontSize: 24, fontWeight: 700, color: 'var(--paper)', marginBottom: 8 }}>{badge.name}</h3>
        <p style={{ color: 'var(--paper-dim)', marginBottom: 32, fontSize: 14 }}>{badge.description}</p>

        <button
          onClick={hideBadge}
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center', fontSize: 15 }}
        >
          Awesome!
        </button>
      </div>
    </div>
  );
}
