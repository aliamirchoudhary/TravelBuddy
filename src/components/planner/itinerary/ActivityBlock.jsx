import { useState }       from 'react';
import ActivityEditModal  from './ActivityEditModal';
import useItineraryStore  from '../../../store/itineraryStore';

export default function ActivityBlock({ activity, dayIndex, actIndex }) {
  const { removeActivity } = useItineraryStore();
  const [editing, setEditing] = useState(false);

  return (
    <>
      <div className="glass-bright" style={{
        display: 'flex', gap: '16px', alignItems: 'flex-start',
        padding: '16px', borderRadius: '14px', 
        border: '1px solid var(--paper-ghost)',
        transition: 'transform 0.3s ease',
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateX(6px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'none'}
      >
        {/* Content */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h5 style={{ margin: 0, fontWeight: 800, fontSize: '15px', color: 'var(--paper)', fontFamily: 'var(--font-heading)' }}>{activity.title}</h5>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setEditing(true)}
                className="btn btn-surface"
                style={{ padding: '4px 10px', fontSize: '10px', borderRadius: '6px' }}>
                EDIT
              </button>
              <button onClick={() => removeActivity(dayIndex, actIndex)}
                className="btn btn-outline"
                style={{ padding: '4px 8px', fontSize: '10px', borderRadius: '6px', color: 'var(--accent2)', borderColor: 'var(--accent2)' }}>
                ✕
              </button>
            </div>
          </div>

          {activity.locationName && (
            <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'var(--accent)', fontWeight: 700 }}>
              📍 {activity.locationName.toUpperCase()}
            </p>
          )}
          
          {activity.description && (
            <p style={{ margin: '8px 0 0', fontSize: '14px', color: 'var(--paper-muted)', lineHeight: 1.5 }}>
              {activity.description}
            </p>
          )}

          <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
            {activity.durationMinutes > 0 && (
              <span style={{ fontSize: '11px', color: 'var(--paper-dim)', fontWeight: 700 }}>
                ⏱ {activity.durationMinutes} MIN
              </span>
            )}
            {parseFloat(activity.estimatedCost) > 0 ? (
              <span style={{ fontSize: '11px', color: 'var(--accent3)', fontWeight: 700 }}>
                💵 ${activity.estimatedCost}
              </span>
            ) : (
              <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 700 }}>
                ✨ FREE
              </span>
            )}
          </div>
        </div>
      </div>

      {editing && (
        <ActivityEditModal
          activity={activity}
          dayIndex={dayIndex}
          actIndex={actIndex}
          onClose={() => setEditing(false)}
        />
      )}
    </>
  );
}
