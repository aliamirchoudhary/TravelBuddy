import { useMemo, useState } from 'react';

const EMERGENCY_BY_COUNTRY = {
  japan: { police: '110', ambulance: '119', fire: '119' },
  pakistan: { police: '15', ambulance: '1122', fire: '16' },
  turkey: { police: '155', ambulance: '112', fire: '110' },
  uk: { police: '999', ambulance: '999', fire: '999' },
  'united kingdom': { police: '999', ambulance: '999', fire: '999' },
  usa: { police: '911', ambulance: '911', fire: '911' },
  'united states': { police: '911', ambulance: '911', fire: '911' },
  france: { police: '17', ambulance: '15', fire: '18' },
  germany: { police: '110', ambulance: '112', fire: '112' },
  italy: { police: '113', ambulance: '118', fire: '115' },
  spain: { police: '091', ambulance: '112', fire: '080' },
  uae: { police: '999', ambulance: '998', fire: '997' },
  'united arab emirates': { police: '999', ambulance: '998', fire: '997' },
  india: { police: '100', ambulance: '102', fire: '101' },
  australia: { police: '000', ambulance: '000', fire: '000' },
  canada: { police: '911', ambulance: '911', fire: '911' },
  china: { police: '110', ambulance: '120', fire: '119' },
  thailand: { police: '191', ambulance: '1669', fire: '199' },
  singapore: { police: '999', ambulance: '995', fire: '995' },
  'saudi arabia': { police: '999', ambulance: '997', fire: '998' },
};

const DEFAULT_EMERGENCY = { police: '112', ambulance: '112', fire: '112' };

function getEmergency(countryName) {
  const key = String(countryName || '').trim().toLowerCase();
  return EMERGENCY_BY_COUNTRY[key] || DEFAULT_EMERGENCY;
}

export default function SOSButton({ countryName }) {
  const [open, setOpen] = useState(false);
  const emergency = useMemo(() => getEmergency(countryName), [countryName]);

  return (
    <>
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9998,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(4px)',
          }}
        />
      )}

      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '20px',
            zIndex: 9999,
            width: 'min(320px, calc(100vw - 40px))',
            background: 'var(--surface2)',
            border: '1px solid rgba(255,80,60,0.35)',
            borderRadius: '20px',
            padding: '22px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            animation: 'fadeUp 0.25s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <div style={{ fontWeight: 900, fontSize: '16px', color: '#ff5040' }}>SOS Emergency</div>
              <div style={{ fontSize: '11px', color: 'var(--paper-muted)', marginTop: '3px' }}>
                {countryName || 'International fallback (112)'}
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ background: 'transparent', border: 'none', color: 'var(--paper-dim)', fontSize: '18px', cursor: 'pointer', padding: '4px 8px' }}
            >
              x
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
            {[
              ['Ambulance', emergency.ambulance],
              ['Police', emergency.police],
              ['Fire', emergency.fire],
            ].map(([label, num]) => (
              <a
                key={label}
                href={`tel:${num}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '14px 10px',
                  borderRadius: '14px',
                  textDecoration: 'none',
                  background: 'rgba(255,80,60,0.08)',
                  border: '1px solid rgba(255,80,60,0.2)',
                  transition: 'background 0.2s',
                  gridColumn: label === 'Ambulance' ? 'span 2' : undefined,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,80,60,0.18)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,80,60,0.08)';
                }}
              >
                <span style={{ fontWeight: 900, fontSize: '20px', color: '#ff5040' }}>{num}</span>
                <span style={{ fontSize: '10px', color: 'var(--paper-dim)', marginTop: '2px' }}>{label}</span>
              </a>
            ))}
          </div>

          <a
            href="https://travel.state.gov/content/travel/en/international-travel/before-you-go/travelers-with-special-considerations/traveling-abroad-with-disabilities.html"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'block', textAlign: 'center', fontSize: '12px', color: 'var(--paper-muted)', textDecoration: 'underline', marginTop: '4px' }}
          >
            Find your embassy
          </a>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Emergency SOS"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 9999,
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: open ? '#cc2010' : '#ff3a28',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '22px',
          fontWeight: 900,
          boxShadow: open
            ? '0 0 0 4px rgba(255,58,40,0.25), 0 8px 24px rgba(255,58,40,0.5)'
            : '0 0 0 0px rgba(255,58,40,0), 0 6px 20px rgba(255,58,40,0.45)',
          transition: 'background 0.2s, box-shadow 0.2s, transform 0.15s',
          transform: open ? 'scale(0.92)' : 'scale(1)',
          animation: open ? 'none' : 'sos-pulse 2.5s ease-in-out infinite',
        }}
      >
        SOS
        <style>{`
          @keyframes sos-pulse {
            0%,100% { box-shadow: 0 0 0 0px rgba(255,58,40,0.45), 0 6px 20px rgba(255,58,40,0.45); }
            60%      { box-shadow: 0 0 0 10px rgba(255,58,40,0),   0 6px 20px rgba(255,58,40,0.45); }
          }
        `}</style>
      </button>
    </>
  );
}