import { useState }  from 'react';
import useTripStore  from '../../store/tripStore';
import api           from '../../services/api';

export default function PlannerTopBar() {
  const { trip, setTripField } = useTripStore();
  const [editing, setEditing]  = useState(false);
  const [nameVal, setNameVal]  = useState('');

  const startEdit = () => { setNameVal(trip.TripName); setEditing(true); };
  const saveEdit  = async () => {
    setEditing(false);
    if (nameVal === trip.TripName || !nameVal.trim()) return;
    setTripField('TripName', nameVal);
    await api.patch(`/trips/${trip.TripID}`, { tripName: nameVal });
  };

  const completionColor =
    trip.CompletionPct >= 75 ? '#16a34a'
  : trip.CompletionPct >= 40 ? '#ca8a04'
  : '#4F46E5';

  return (
    <div className="glass" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 24px', borderBottom: '1px solid var(--border)',
      background: 'rgba(12,14,17,0.7)', gap: '16px', flexShrink: 0,
      backdropFilter: 'blur(20px)', zIndex: 100
    }}>
      {/* Trip name — inline edit */}
      <div style={{ flex: 1 }}>
        {editing ? (
          <input
            autoFocus value={nameVal}
            onChange={e => setNameVal(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={e => e.key === 'Enter' && saveEdit()}
            className="input-light"
            style={{ fontSize: '20px', fontWeight: 900, width: '100%', maxWidth: '400px', fontFamily: 'var(--font-display)' }}
          />
        ) : (
          <h2 onClick={startEdit} className="display-heading" style={{ margin: 0, fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
            title="Click to rename">
            {trip.TripName} <span style={{ fontSize: 14, opacity: 0.5 }}>✏️</span>
          </h2>
        )}
        <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--paper-muted)', fontFamily: 'var(--font-label)', letterSpacing: '0.5px' }}>
          {trip.CityName ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 16 }}>{trip.FlagEmoji}</span>
              <span className="text-gradient" style={{ fontWeight: 700 }}>{trip.CityName.toUpperCase()}</span>
              {trip.StartDate && (
                <span style={{ opacity: 0.6 }}>
                  • {new Date(trip.StartDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} → {new Date(trip.EndDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              )}
            </span>
          ) : 'SET DESTINATION'}
        </p>
      </div>

      {/* Progress bar */}
      <div style={{ width: '180px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '10px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '1px' }}>
          <span>PLANNING PROGRESS</span>
          <span>{trip.CompletionPct}%</span>
        </div>
        <div style={{ background: 'var(--paper-ghost)', borderRadius: '10px', height: '6px', width: '100%', overflow: 'hidden' }}>
          <div style={{
            width: `${trip.CompletionPct}%`, height: '100%',
            background: 'var(--grad-cyan)', boxShadow: '0 0 15px var(--accent)',
            transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
          }} />
        </div>
      </div>

      {/* Share button */}
      <button
        onClick={() => api.patch(`/trips/${trip.TripID}`, { isShared: !trip.IsShared }).then(() => setTripField('IsShared', !trip.IsShared))}
        className={trip.IsShared ? 'btn btn-primary' : 'btn btn-outline'}
        style={{ padding: '8px 20px', fontSize: '12px' }}
      >
        {trip.IsShared ? '🔗 SHARED' : 'SHARE TRIP'}
      </button>
    </div>
  );
}
