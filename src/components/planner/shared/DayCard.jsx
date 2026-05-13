import { useState }  from 'react';
import api           from '../../../services/api';

export default function DayCard({ day, tripId, onUpdate }) {
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemTime, setNewItemTime]   = useState('');
  const [adding, setAdding]             = useState(false);
  const [isExpanded, setIsExpanded]     = useState(true);

  const addItem = async () => {
    if (!newItemTitle.trim()) return;
    setAdding(true);
    try {
      await api.post(`/trips/${tripId}/days/${day.DayID}/items`, {
        title: newItemTitle,
        timeSlot: newItemTime || null,
        sortOrder: (day.Items || []).length,
      });
      setNewItemTitle('');
      setNewItemTime('');
      onUpdate();
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  const deleteItem = async (itemId) => {
    try {
      await api.delete(`/trips/${tripId}/items/${itemId}`);
      onUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bento-card" style={{ 
      marginBottom: '16px', 
      border: '1px solid var(--border)',
      background: 'rgba(255,255,255,0.02)',
      transform: 'none', // Override bento-card hover for itinerary
    }}>
      {/* Day header */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ 
          padding: '16px 24px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          cursor: 'pointer',
          background: isExpanded ? 'rgba(129,236,255,0.03)' : 'transparent',
          borderBottom: isExpanded ? '1px solid var(--border)' : 'none',
          transition: 'all 0.3s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            width: '32px', height: '32px', borderRadius: '8px', 
            background: 'var(--grad-cyan)', color: 'var(--ink)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: 900
          }}>
            {day.DayNumber}
          </div>
          <div>
            <span style={{ fontWeight: 800, color: 'var(--paper)', fontSize: '15px', fontFamily: 'var(--font-heading)' }}>
              {day.Title?.toUpperCase() || `DAY ${day.DayNumber}`}
            </span>
            {day.DayDate && (
              <div style={{ fontSize: '11px', color: 'var(--paper-dim)', fontWeight: 600, letterSpacing: '0.5px' }}>
                {new Date(day.DayDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()}
              </div>
            )}
          </div>
        </div>
        <div style={{ color: 'var(--paper-dim)', fontSize: '12px' }}>
          {isExpanded ? '▼' : '▲'}
        </div>
      </div>

      {/* Items list */}
      {isExpanded && (
        <div style={{ padding: '12px 24px 24px' }}>
          {day.Items && day.Items.length > 0 ? (
            <div style={{ marginBottom: '20px' }}>
              {day.Items.map((item, idx) => (
                <div key={item.ItemID} style={{ 
                  display: 'flex', alignItems: 'center', gap: '20px', 
                  padding: '14px 0', borderBottom: idx === day.Items.length - 1 ? 'none' : '1px solid var(--paper-ghost)',
                  animation: `slideIn 0.3s ease ${idx * 0.05}s both`
                }}>
                  <div style={{ 
                    minWidth: '60px', fontSize: '12px', color: 'var(--accent)', 
                    fontWeight: 700, fontFamily: 'var(--font-label)', letterSpacing: '1px' 
                  }}>
                    {item.TimeSlot || 'ANYTIME'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '15px', color: 'var(--paper)', fontWeight: 600 }}>{item.Title}</p>
                    {item.Description && <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--paper-muted)' }}>{item.Description}</p>}
                  </div>
                  {item.Cost > 0 && (
                    <div className="badge badge-cyan" style={{ fontSize: '11px' }}>
                      ${parseFloat(item.Cost).toFixed(0)}
                    </div>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); deleteItem(item.ItemID); }}
                    style={{ 
                      background: 'var(--paper-ghost)', border: 'none', cursor: 'pointer', 
                      color: 'var(--accent2)', fontSize: '14px', width: '28px', height: '28px', 
                      borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      transition: 'all 0.2s' 
                    }}
                    onMouseEnter={e => e.target.style.background = 'rgba(255,115,83,0.15)'}
                    onMouseLeave={e => e.target.style.background = 'var(--paper-ghost)'}
                  >✕</button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--paper-dim)', fontSize: '13px', fontStyle: 'italic' }}>
              No activities locked in for this day.
            </div>
          )}

          {/* Add item row */}
          <div className="glass-bright" style={{ 
            display: 'flex', gap: '12px', padding: '12px', 
            borderRadius: '14px', border: '1px dashed var(--border)' 
          }}>
            <input type="time" value={newItemTime} onChange={e => setNewItemTime(e.target.value)}
              className="input-light"
              style={{ width: '100px', padding: '8px', borderRadius: '10px', fontSize: '13px', background: 'transparent' }} />
            <input placeholder="Add activity..." value={newItemTitle} onChange={e => setNewItemTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addItem()}
              className="input-light"
              style={{ flex: 1, padding: '8px 14px', borderRadius: '10px', fontSize: '14px', background: 'transparent' }} />
            <button onClick={addItem} disabled={adding} className="btn btn-primary"
              style={{ padding: '8px 18px', borderRadius: '10px', fontSize: '12px' }}>
              {adding ? '...' : 'ADD'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
