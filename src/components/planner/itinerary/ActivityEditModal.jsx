import { useState }       from 'react';
import useItineraryStore  from '../../../store/itineraryStore';

const SLOTS = ['morning', 'afternoon', 'evening'];

export default function ActivityEditModal({ activity, dayIndex, actIndex, onClose }) {
  const { updateActivity } = useItineraryStore();
  const [form, setForm]    = useState({ ...activity });

  const save = () => {
    updateActivity(dayIndex, actIndex, form);
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="bento-card" style={{ padding: '40px', width: '450px', border: '1px solid var(--border-cyan)' }}>
        <h3 className="display-heading" style={{ fontSize: '24px', marginBottom: '24px' }}>Edit Activity</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {[
            { label: 'TITLE',    key: 'title',        type: 'text'   },
            { label: 'LOCATION', key: 'locationName', type: 'text'   },
            { label: 'DURATION (MINUTES)', key: 'durationMinutes', type: 'number' },
            { label: 'EST. COST (USD)',    key: 'estimatedCost',   type: 'number' },
          ].map(f => (
            <div key={f.key}>
              <label className="tag" style={{ marginBottom: '8px' }}>{f.label}</label>
              <input type={f.type} value={form[f.key] || ''}
                onChange={e => setForm(x => ({ ...x, [f.key]: f.type === 'number' ? parseFloat(e.target.value) : e.target.value }))}
                className="input-light"
                style={{ width: '100%', padding: '14px', borderRadius: '12px' }}
              />
            </div>
          ))}

          <div>
            <label className="tag" style={{ marginBottom: '8px' }}>DESCRIPTION</label>
            <textarea value={form.description || ''} rows={3}
              onChange={e => setForm(x => ({ ...x, description: e.target.value }))}
              className="input-light"
              style={{ width: '100%', padding: '14px', borderRadius: '12px', resize: 'vertical' }} />
          </div>

          <div>
            <label className="tag" style={{ marginBottom: '8px' }}>TIME SLOT</label>
            <select value={form.timeSlot} onChange={e => setForm(x => ({ ...x, timeSlot: e.target.value }))}
              className="input-light"
              style={{ width: '100%', padding: '14px', borderRadius: '12px' }}>
              {SLOTS.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            <button onClick={onClose} className="btn btn-outline"
              style={{ flex: 1, padding: '14px' }}>
              CANCEL
            </button>
            <button onClick={save} className="btn btn-primary"
              style={{ flex: 1, padding: '14px' }}>
              SAVE CHANGES
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
