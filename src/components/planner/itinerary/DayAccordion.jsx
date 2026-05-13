import { useState }       from 'react';
import ActivityBlock      from './ActivityBlock';

const TIME_ORDER = { morning: 0, afternoon: 1, evening: 2 };
const TIME_EMOJI = { morning: '🌅', afternoon: '☀️', evening: '🌙' };

export default function DayAccordion({ day, dayIndex }) {
  const [open, setOpen] = useState(dayIndex === 0);

  const totalCost = day.activities.reduce((s, a) => s + (parseFloat(a.estimatedCost) || 0), 0);
  const sorted    = [...day.activities].sort((a, b) => TIME_ORDER[a.timeSlot] - TIME_ORDER[b.timeSlot]);

  return (
    <div className="glass" style={{ 
      border: '1px solid var(--border)', 
      borderRadius: '16px', 
      marginBottom: '16px', 
      overflow: 'hidden',
      background: open ? 'rgba(255,255,255,0.03)' : 'transparent',
      transition: 'all 0.4s ease'
    }}>
      {/* Header */}
      <div onClick={() => setOpen(o => !o)}
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '20px 24px', 
          cursor: 'pointer', 
          background: open ? 'rgba(129,236,255,0.05)' : 'transparent' 
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            width: '32px', height: '32px', borderRadius: '8px', 
            background: 'var(--grad-cyan)', color: 'var(--ink)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: 900
          }}>
            {day.day}
          </div>
          <div>
            <span style={{ fontWeight: 800, color: 'var(--paper)', fontSize: '15px', fontFamily: 'var(--font-heading)' }}>
              {day.DayDate ? new Date(day.DayDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase() : `DAY ${day.day}`}
            </span>
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <span className="badge badge-surface" style={{ fontSize: '9px', padding: '2px 8px' }}>
                {day.activities.length} ACTIVITIES
              </span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {totalCost > 0 && (
            <span style={{ fontSize: '14px', fontWeight: 900, color: 'var(--paper)' }}>
              ${totalCost.toFixed(0)}
            </span>
          )}
          <span style={{ color: 'var(--paper-dim)', fontSize: '12px', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}>▼</span>
        </div>
      </div>

      {/* Activities */}
      {open && (
        <div style={{ padding: '8px 24px 24px', animation: 'fadeDown 0.4s ease' }}>
          {['morning', 'afternoon', 'evening'].map(slot => {
            const slotActs = sorted.filter(a => a.timeSlot === slot);
            if (!slotActs.length) return null;
            return (
              <div key={slot} style={{ marginTop: '20px' }}>
                <p className="tag" style={{ fontSize: '10px', color: 'var(--accent)', marginBottom: '12px' }}>
                   {TIME_EMOJI[slot]} {slot.toUpperCase()}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {slotActs.map((act, ai) => (
                    <ActivityBlock
                      key={ai}
                      activity={act}
                      dayIndex={dayIndex}
                      actIndex={day.activities.indexOf(act)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
