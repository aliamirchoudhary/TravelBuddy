import useTripStore from '../../../store/tripStore';
import api          from '../../../services/api';
import { useState, useCallback, useEffect, useMemo } from 'react';

const MODES = [
  { id: 'flight', icon: '✈️', label: 'Flight',  color: 'rgba(129,236,255,0.12)', border: 'rgba(129,236,255,0.3)' },
  { id: 'train',  icon: '🚂', label: 'Train',   color: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.3)'  },
  { id: 'bus',    icon: '🚌', label: 'Bus',     color: 'rgba(251,191,36,0.10)',  border: 'rgba(251,191,36,0.3)'  },
  { id: 'drive',  icon: '🚗', label: 'Drive',   color: 'rgba(251,146,60,0.10)',  border: 'rgba(251,146,60,0.3)'  },
  { id: 'ferry',  icon: '⛴️', label: 'Ferry',   color: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.3)' },
];

const CURRENCIES = ['USD','EUR','GBP','PKR','JPY','TRY','AED','INR','CAD','AUD'];

const TRANSPORT_APIS = {
  flight: { label: 'Skyscanner', url: (from, to) => `https://www.skyscanner.com/transport/flights/${encodeURIComponent(from)}/${encodeURIComponent(to)}/` },
  train:  { label: 'Rome2rio',   url: (from, to) => `https://www.rome2rio.com/map/${encodeURIComponent(from)}/${encodeURIComponent(to)}` },
  bus:    { label: 'Rome2rio',   url: (from, to) => `https://www.rome2rio.com/map/${encodeURIComponent(from)}/${encodeURIComponent(to)}` },
  drive:  { label: 'Google Maps',url: (from, to) => `https://www.google.com/maps/dir/${encodeURIComponent(from)}/${encodeURIComponent(to)}` },
  ferry:  { label: 'Rome2rio',   url: (from, to) => `https://www.rome2rio.com/map/${encodeURIComponent(from)}/${encodeURIComponent(to)}` },
};

function useToast() {
  const [toast, setToast] = useState(null);
  const show = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  }, []);
  return { toast, show };
}

const EMPTY_FORM = { fromPlace: '', toPlace: '', transportMode: 'flight', estimatedCost: '', currency: 'USD', durationMins: '', notes: '' };

// Build Google Maps embed URL for a route
function buildMapEmbedUrl(from, to, apiKey) {
  if (!apiKey || !from || !to) return null;
  const origin = encodeURIComponent(from);
  const dest   = encodeURIComponent(to);
  return `https://www.google.com/maps/embed/v1/directions?key=${apiKey}&origin=${origin}&destination=${dest}&mode=driving`;
}

// Build Google Maps embed URL for a city (attractions/hotels)
function buildCityMapUrl(city, apiKey) {
  if (!apiKey || !city) return null;
  return `https://www.google.com/maps/embed/v1/search?key=${apiKey}&q=hotels+hospitals+attractions+in+${encodeURIComponent(city)}`;
}

// Comparison table: estimated cost bands by mode for a route distance
// Used when no API key available — gives user rough comparison
function TransportComparison({ from, to, mode, estimatedCost, currency }) {
  const comparisons = [
    { mode: 'flight', icon: '✈️', label: 'Flight',    time: 'Check Skyscanner', link: TRANSPORT_APIS.flight.url(from, to), cta: 'Skyscanner' },
    { mode: 'train',  icon: '🚂', label: 'Train',     time: 'Check Rome2rio',   link: TRANSPORT_APIS.train.url(from, to),  cta: 'Rome2rio'  },
    { mode: 'bus',    icon: '🚌', label: 'Bus',       time: 'Check Rome2rio',   link: TRANSPORT_APIS.bus.url(from, to),    cta: 'Rome2rio'  },
    { mode: 'drive',  icon: '🚗', label: 'Drive',     time: 'Check Google Maps',link: TRANSPORT_APIS.drive.url(from, to),  cta: 'Maps'      },
    { mode: 'ferry',  icon: '⛴️', label: 'Ferry',     time: 'Check Rome2rio',   link: TRANSPORT_APIS.ferry.url(from, to),  cta: 'Rome2rio'  },
  ];

  return (
    <div>
      <div style={{ fontSize:'11px', fontWeight:700, color:'var(--paper-dim)', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'12px' }}>
        Compare Options: {from} → {to}
      </div>
      {comparisons.map(c => (
        <a
          key={c.mode}
          href={c.link}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display:'flex', alignItems:'center', gap:'12px',
            padding:'12px 14px', borderRadius:'10px', marginBottom:'8px',
            background: c.mode === mode ? 'rgba(129,236,255,0.08)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${c.mode === mode ? 'var(--border-cyan)' : 'var(--border)'}`,
            textDecoration:'none', color:'inherit',
            transition:'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
          onMouseLeave={e => e.currentTarget.style.background = c.mode === mode ? 'rgba(129,236,255,0.08)' : 'rgba(255,255,255,0.03)'}
        >
          <span style={{ fontSize:'20px', flexShrink:0 }}>{c.icon}</span>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, fontSize:'13px' }}>{c.label}</div>
            <div style={{ fontSize:'11px', color:'var(--paper-dim)' }}>{c.time}</div>
          </div>
          {c.mode === mode && estimatedCost && (
            <div style={{ fontSize:'13px', fontWeight:800, color:'var(--accent)' }}>
              {currency} {Number(estimatedCost).toFixed(2)}
            </div>
          )}
          <span style={{ fontSize:'11px', fontWeight:700, color:'var(--accent)', background:'rgba(129,236,255,0.1)', padding:'4px 8px', borderRadius:'6px', flexShrink:0 }}>
            {c.cta} ↗
          </span>
        </a>
      ))}
    </div>
  );
}

// Map panel component
function MapPanel({ selectedRoute, trip }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY || '';
  const city   = trip?.CityName || '';

  const mapUrl = useMemo(() => {
    if (selectedRoute) {
      return buildMapEmbedUrl(selectedRoute.FromPlace, selectedRoute.ToPlace, apiKey);
    }
    return buildCityMapUrl(city, apiKey);
  }, [selectedRoute, city, apiKey]);

  const fallbackUrl = selectedRoute
    ? `https://www.google.com/maps/dir/${encodeURIComponent(selectedRoute.FromPlace)}/${encodeURIComponent(selectedRoute.ToPlace)}`
    : city ? `https://www.google.com/maps/search/attractions+hotels+in+${encodeURIComponent(city)}` : null;

  if (!apiKey) {
    // No API key — show placeholder with open-in-maps link
    return (
      <div style={{
        height:'100%', borderRadius:'16px', overflow:'hidden',
        background:'rgba(0,0,0,0.3)', border:'1px solid var(--border)',
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        gap:'16px', padding:'32px', textAlign:'center',
      }}>
        <div style={{ fontSize:'48px' }}>{selectedRoute ? '🗺️' : '📍'}</div>
        <div>
          <div style={{ fontWeight:800, fontSize:'15px', marginBottom:'6px' }}>
            {selectedRoute ? `${selectedRoute.FromPlace} → ${selectedRoute.ToPlace}` : city ? `${city} Map` : 'Interactive Map'}
          </div>
          <div style={{ fontSize:'12px', color:'var(--paper-dim)', marginBottom:'16px' }}>
            Add <code style={{ background:'rgba(255,255,255,0.08)', padding:'2px 6px', borderRadius:'4px' }}>VITE_GOOGLE_MAPS_KEY</code> to .env to enable embedded map.
          </div>
          {fallbackUrl && (
            <a
              href={fallbackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ padding:'10px 22px', fontSize:'13px', display:'inline-block', textDecoration:'none' }}
            >
              Open in Google Maps ↗
            </a>
          )}
        </div>
        {city && !selectedRoute && (
          <div style={{ fontSize:'11px', color:'var(--paper-ghost)' }}>
            Showing attractions &amp; hotels in {city}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ height:'100%', borderRadius:'16px', overflow:'hidden', border:'1px solid var(--border)', position:'relative' }}>
      <iframe
        title="route-map"
        width="100%"
        height="100%"
        style={{ border:'none', display:'block' }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src={mapUrl}
      />
      {fallbackUrl && (
        <a
          href={fallbackUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            position:'absolute', bottom:'12px', right:'12px',
            background:'rgba(0,0,0,0.75)', color:'#fff',
            padding:'6px 12px', borderRadius:'8px', fontSize:'12px',
            fontWeight:700, textDecoration:'none', backdropFilter:'blur(8px)',
          }}
        >
          Open in Maps ↗
        </a>
      )}
    </div>
  );
}

export default function RoutesTab() {
  const { trip, routes, refreshTrip } = useTripStore();
  const { toast, show: showToast }    = useToast();
  const [form, setForm]               = useState(EMPTY_FORM);
  const [isAdding, setIsAdding]       = useState(false);
  const [deletingId, setDeletingId]   = useState(null);
  const [showForm, setShowForm]       = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [rightTab, setRightTab]       = useState('compare'); // 'compare' | 'city'

  // Auto-select first route on load
  useEffect(() => {
    if (routes.length > 0 && !selectedRoute) {
      setSelectedRoute(routes[0]);
    }
    if (routes.length === 0) {
      setSelectedRoute(null);
    }
  }, [routes]);

  const totalCost = routes.reduce((sum, r) => sum + Number(r.EstimatedCost || 0), 0);

  const addRoute = async () => {
    if (!form.fromPlace.trim() || !form.toPlace.trim()) {
      showToast('From and To are required.', 'error');
      return;
    }
    setIsAdding(true);
    try {
      await api.post(`/trips/${trip.TripID}/routes`, {
        fromPlace:     form.fromPlace.trim(),
        toPlace:       form.toPlace.trim(),
        transportMode: form.transportMode,
        estimatedCost: parseFloat(form.estimatedCost) || null,
        currency:      form.currency,
        durationMins:  parseInt(form.durationMins) || null,
        notes:         form.notes.trim() || null,
      });
      setForm(EMPTY_FORM);
      setShowForm(false);
      await refreshTrip();
      showToast('Route added!');
    } catch {
      showToast('Failed to add route.', 'error');
    } finally {
      setIsAdding(false);
    }
  };

  const deleteRoute = async (routeId) => {
    setDeletingId(routeId);
    try {
      await api.delete(`/trips/${trip.TripID}/routes/${routeId}`);
      if (selectedRoute?.RouteID === routeId) setSelectedRoute(null);
      await refreshTrip();
      showToast('Route removed.');
    } catch {
      showToast('Failed to delete route.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div style={{ animation:'fadeIn 0.8s ease', position:'relative' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position:'fixed', top:'24px', right:'24px', zIndex:9999,
          padding:'14px 22px', borderRadius:'12px', fontWeight:700, fontSize:'14px',
          background: toast.type === 'error' ? 'rgba(255,115,83,0.95)' : 'rgba(52,211,153,0.95)',
          color:'#fff', boxShadow:'0 8px 32px rgba(0,0,0,0.4)', animation:'fadeIn 0.3s ease',
        }}>
          {toast.type === 'error' ? '⚠️' : '✓'} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom:'24px', display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <h3 className="display-heading" style={{ fontSize:'32px', marginBottom:'8px' }}>
            Routes &amp; <span className="text-gradient">Transport</span>
          </h3>
          <p style={{ color:'var(--paper-muted)', fontSize:'15px', margin:0 }}>Plan segments, compare options, view on map.</p>
        </div>
        <div style={{ display:'flex', gap:'12px', alignItems:'center', flexWrap:'wrap' }}>
          {routes.length > 0 && (
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:'11px', fontWeight:700, color:'var(--paper-dim)', letterSpacing:'1px', textTransform:'uppercase' }}>Total Transport</div>
              <div style={{ fontSize:'22px', fontWeight:900, color:'var(--accent)' }}>${totalCost.toFixed(2)}</div>
            </div>
          )}
          <button
            onClick={() => setShowForm(v => !v)}
            className="btn btn-primary"
            style={{ padding:'12px 22px', fontSize:'13px' }}
          >
            {showForm ? '✕ Cancel' : '+ Log Segment'}
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bento-card" style={{ padding:'24px', marginBottom:'24px' }}>
          <div className="tag" style={{ marginBottom:'16px' }}>Log a Travel Segment</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px' }}>
            <div>
              <label style={{ fontSize:'11px', fontWeight:700, color:'var(--paper-dim)', letterSpacing:'1px', display:'block', marginBottom:'6px' }}>FROM</label>
              <input placeholder="e.g. Narita Airport" value={form.fromPlace} onChange={e => f('fromPlace', e.target.value)} onKeyDown={e => e.key === 'Enter' && addRoute()} className="input-light" style={{ width:'100%', padding:'12px 14px', boxSizing:'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize:'11px', fontWeight:700, color:'var(--paper-dim)', letterSpacing:'1px', display:'block', marginBottom:'6px' }}>TO</label>
              <input placeholder="e.g. Shinjuku Hotel" value={form.toPlace} onChange={e => f('toPlace', e.target.value)} onKeyDown={e => e.key === 'Enter' && addRoute()} className="input-light" style={{ width:'100%', padding:'12px 14px', boxSizing:'border-box' }} />
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'auto 1fr auto auto', gap:'12px', marginBottom:'12px' }}>
            <div>
              <label style={{ fontSize:'11px', fontWeight:700, color:'var(--paper-dim)', letterSpacing:'1px', display:'block', marginBottom:'6px' }}>MODE</label>
              <select value={form.transportMode} onChange={e => f('transportMode', e.target.value)} className="input-light" style={{ padding:'12px 14px' }}>
                {MODES.map(m => <option key={m.id} value={m.id}>{m.icon} {m.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize:'11px', fontWeight:700, color:'var(--paper-dim)', letterSpacing:'1px', display:'block', marginBottom:'6px' }}>EST. COST</label>
              <input type="number" placeholder="0.00" value={form.estimatedCost} onChange={e => f('estimatedCost', e.target.value)} className="input-light" style={{ width:'100%', padding:'12px 14px', boxSizing:'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize:'11px', fontWeight:700, color:'var(--paper-dim)', letterSpacing:'1px', display:'block', marginBottom:'6px' }}>CURRENCY</label>
              <select value={form.currency} onChange={e => f('currency', e.target.value)} className="input-light" style={{ padding:'12px 14px' }}>
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize:'11px', fontWeight:700, color:'var(--paper-dim)', letterSpacing:'1px', display:'block', marginBottom:'6px' }}>DURATION (MIN)</label>
              <input type="number" placeholder="90" value={form.durationMins} onChange={e => f('durationMins', e.target.value)} className="input-light" style={{ width:'100px', padding:'12px 14px' }} />
            </div>
          </div>
          <div style={{ marginBottom:'18px' }}>
            <label style={{ fontSize:'11px', fontWeight:700, color:'var(--paper-dim)', letterSpacing:'1px', display:'block', marginBottom:'6px' }}>NOTES (OPTIONAL)</label>
            <input placeholder="e.g. Book ticket in advance" value={form.notes} onChange={e => f('notes', e.target.value)} className="input-light" style={{ width:'100%', padding:'12px 14px', boxSizing:'border-box' }} />
          </div>
          <button onClick={addRoute} disabled={isAdding} className="btn btn-primary" style={{ padding:'13px 28px' }}>
            {isAdding ? '…' : 'ADD ROUTE'}
          </button>
        </div>
      )}

      {/* Two-panel layout */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 420px', gap:'20px', minHeight:'520px' }}>

        {/* LEFT: Map */}
        <div style={{ minHeight:'520px' }}>
          {/* City map toggle when no route selected */}
          {!selectedRoute && trip?.CityName && (
            <div style={{ marginBottom:'12px', display:'flex', gap:'8px' }}>
              <button
                onClick={() => setRightTab('city')}
                className={rightTab === 'city' ? 'btn btn-primary' : 'btn btn-outline'}
                style={{ padding:'8px 16px', fontSize:'12px' }}
              >
                📍 {trip.CityName} Map
              </button>
            </div>
          )}
          <MapPanel selectedRoute={selectedRoute} trip={trip} />
        </div>

        {/* RIGHT: Route list + comparison */}
        <div style={{ display:'flex', flexDirection:'column', gap:'14px', overflow:'auto', maxHeight:'600px' }}>

          {/* Route cards (scrollable list) */}
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {routes.length > 0 ? routes.map(r => {
              const modeData = MODES.find(m => m.id === r.TransportMode) || { icon:'📍', label: r.TransportMode, color:'rgba(255,255,255,0.05)', border:'var(--border)' };
              const isDel    = deletingId === r.RouteID;
              const isSel    = selectedRoute?.RouteID === r.RouteID;

              return (
                <div
                  key={r.RouteID}
                  onClick={() => setSelectedRoute(isSel ? null : r)}
                  className="bento-card"
                  style={{
                    padding:'16px 18px', cursor:'pointer',
                    background: isSel ? 'rgba(129,236,255,0.08)' : modeData.color,
                    borderColor: isSel ? 'var(--border-cyan)' : (isDel ? 'transparent' : undefined),
                    opacity: isDel ? 0.5 : 1,
                    transition:'all 0.2s',
                  }}
                >
                  <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                    <span style={{ fontSize:'22px', flexShrink:0 }}>{modeData.icon}</span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', gap:'6px', alignItems:'center', flexWrap:'wrap' }}>
                        <span style={{ fontWeight:800, fontSize:'13px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{r.FromPlace}</span>
                        <span style={{ color:'var(--accent)', fontWeight:900 }}>→</span>
                        <span style={{ fontWeight:800, fontSize:'13px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{r.ToPlace}</span>
                      </div>
                      <div style={{ display:'flex', gap:'6px', marginTop:'4px', flexWrap:'wrap', alignItems:'center' }}>
                        <span className="tag" style={{ fontSize:'9px' }}>{modeData.label.toUpperCase()}</span>
                        {r.DurationMins && <span style={{ fontSize:'10px', color:'var(--paper-dim)' }}>⏱ {r.DurationMins}m</span>}
                        {r.EstimatedCost != null && <span style={{ fontSize:'11px', fontWeight:800, color:'var(--paper)' }}>{r.Currency || 'USD'} {Number(r.EstimatedCost).toFixed(2)}</span>}
                      </div>
                      {r.Notes && <div style={{ fontSize:'11px', color:'var(--paper-dim)', fontStyle:'italic', marginTop:'3px' }}>{r.Notes}</div>}
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); deleteRoute(r.RouteID); }}
                      disabled={isDel}
                      style={{ background:'transparent', border:'none', cursor: isDel ? 'default' : 'pointer', color:'var(--paper-ghost)', fontSize:'14px', padding:'4px 6px', borderRadius:'6px', flexShrink:0, transition:'color 0.2s, background 0.2s', opacity: isDel ? 0.4 : 1 }}
                      onMouseEnter={e => { if (!isDel) { e.currentTarget.style.color='var(--accent2)'; e.currentTarget.style.background='rgba(255,115,83,0.1)'; }}}
                      onMouseLeave={e => { e.currentTarget.style.color='var(--paper-ghost)'; e.currentTarget.style.background='transparent'; }}
                    >
                      {isDel ? '…' : '✕'}
                    </button>
                  </div>
                  {isSel && (
                    <div style={{ marginTop:'8px', fontSize:'11px', color:'var(--accent)', fontWeight:700 }}>
                      ↑ Showing on map · See comparison below
                    </div>
                  )}
                </div>
              );
            }) : (
              <div className="bento-card" style={{ padding:'40px', textAlign:'center', opacity:0.45, borderStyle:'dashed' }}>
                <div style={{ fontSize:'32px', marginBottom:'10px' }}>🗺️</div>
                <p style={{ margin:0, fontStyle:'italic', color:'var(--paper-dim)', fontSize:'13px' }}>No travel segments yet.<br/>Click "+ Log Segment" to add one.</p>
              </div>
            )}
          </div>

          {/* Transport comparison panel — shown when route selected */}
          {selectedRoute && (
            <div className="bento-card" style={{ padding:'20px' }}>
              <TransportComparison
                from={selectedRoute.FromPlace}
                to={selectedRoute.ToPlace}
                mode={selectedRoute.TransportMode}
                estimatedCost={selectedRoute.EstimatedCost}
                currency={selectedRoute.Currency || 'USD'}
              />
            </div>
          )}

          {/* City attractions/hotels quick links — always shown */}
          {trip?.CityName && (
            <div className="bento-card" style={{ padding:'20px' }}>
              <div style={{ fontSize:'11px', fontWeight:700, color:'var(--paper-dim)', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'12px' }}>
                📍 Within {trip.CityName}
              </div>
              {[
                { label:'Nearby Hotels',      icon:'🏨', q:`hotels in ${trip.CityName}` },
                { label:'Hospitals',          icon:'🏥', q:`hospitals in ${trip.CityName}` },
                { label:'Top Attractions',    icon:'🎯', q:`tourist attractions in ${trip.CityName}` },
                { label:'Airport Transfers',  icon:'✈️', q:`airport transfer ${trip.CityName}` },
              ].map(item => (
                <a
                  key={item.label}
                  href={`https://www.google.com/maps/search/${encodeURIComponent(item.q)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display:'flex', alignItems:'center', gap:'10px',
                    padding:'10px 12px', borderRadius:'8px', marginBottom:'6px',
                    background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)',
                    textDecoration:'none', color:'inherit', transition:'background 0.2s',
                    fontSize:'13px', fontWeight:600,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                >
                  <span>{item.icon}</span>
                  <span style={{ flex:1 }}>{item.label}</span>
                  <span style={{ fontSize:'11px', color:'var(--accent)' }}>Maps ↗</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
