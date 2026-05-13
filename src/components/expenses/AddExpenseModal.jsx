import { useState } from 'react';
import api           from '../../services/api';
import useExpenseStore from '../../store/expenseStore';

const CURRENCIES = ['PKR', 'USD', 'EUR'];

// Quick inline styles mapping from Travelbuddy theme
const labelStyle = { display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--paper-dim)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 };
const inputStyle = { width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', color: 'var(--paper)', fontSize: 13, outline: 'none' };

export default function AddExpenseModal({ tripId, participants = [], onClose }) {
  const { fetchExpenses, fetchSettlement } = useExpenseStore();

  const [form, setForm] = useState({
    description:   '',
    totalAmount:   '',
    currency:      'PKR',
    paidByUserId:  participants[0]?.UserID || '',
    selectedParts: participants.map(p => p.UserID),
    splitType:     'equal',
    customAmounts: {},
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const toggleParticipant = (uid) => {
    const selected = form.selectedParts.includes(uid)
      ? form.selectedParts.filter(id => id !== uid)
      : [...form.selectedParts, uid];
    update('selectedParts', selected);
  };

  const handleSubmit = async () => {
    if (!form.description || !form.totalAmount)
      return setError('Description and amount are required.');

    setIsSubmitting(true);
    setError('');
    try {
      await api.post('/expenses', {
        tripId,
        description:  form.description,
        totalAmount:  parseFloat(form.totalAmount),
        currency:     form.currency,
        participants: form.selectedParts,
        splitType:    form.splitType,
        customAmounts: form.customAmounts,
      });
      await fetchExpenses(tripId);
      await fetchSettlement(tripId);
      onClose();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to add expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(5,6,10,0.85)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24
    }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-panel)', padding: '24px', width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ margin: 0, color: 'var(--paper)', fontFamily: 'var(--font-heading)', fontSize: 18 }}>Add Expense</h3>

        {error && <p style={{ color: 'var(--accent)', fontSize: '13px', margin: 0 }}>{error}</p>}

        {/* Description */}
        <div>
          <label style={labelStyle}>Description</label>
          <input
            placeholder="e.g. Hotel night 1"
            value={form.description}
            onChange={e => update('description', e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Amount + Currency */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 2 }}>
            <label style={labelStyle}>Amount</label>
            <input
              type="number" placeholder="0.00" value={form.totalAmount}
              onChange={e => update('totalAmount', e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Currency</label>
            <select value={form.currency} onChange={e => update('currency', e.target.value)} style={inputStyle}>
              {CURRENCIES.map(c => <option style={{background:'var(--ink)',color:'var(--paper)'}} key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Paid By */}
        <div>
          <label style={labelStyle}>Paid By</label>
          <select value={form.paidByUserId} onChange={e => update('paidByUserId', parseInt(e.target.value) || e.target.value)} style={inputStyle}>
            {participants.map(p => <option style={{background:'var(--ink)',color:'var(--paper)'}} key={p.UserID} value={p.UserID}>{p.DisplayName}</option>)}
          </select>
        </div>

        {/* Participants */}
        <div>
          <label style={labelStyle}>Split Between</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '6px' }}>
            {participants.map(p => (
              <label key={p.UserID} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--paper)', cursor: 'pointer' }}>
                <input type="checkbox"
                  checked={form.selectedParts.includes(p.UserID)}
                  onChange={() => toggleParticipant(p.UserID)}
                  style={{ accentColor: 'var(--accent)' }}
                />
                {p.DisplayName}
              </label>
            ))}
          </div>
        </div>

        {/* Split Type */}
        <div>
          <label style={labelStyle}>Split Type</label>
          <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
            {['equal', 'custom'].map(t => (
              <button key={t} type="button" onClick={() => update('splitType', t)}
                style={{
                  padding: '6px 14px', borderRadius: '100px', cursor: 'pointer', border: '1px solid var(--accent)',
                  background: form.splitType === t ? 'var(--accent)' : 'transparent',
                  color:      form.splitType === t ? 'var(--dark)'   : 'var(--accent)',
                  textTransform: 'capitalize', fontWeight: 700, fontSize: 13
                }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Amounts */}
        {form.splitType === 'custom' && (
          <div>
            <label style={labelStyle}>Custom Amounts</label>
            {form.selectedParts.map(uid => {
              const p = participants.find(x => x.UserID === uid);
              return (
                <div key={uid} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginTop: '8px' }}>
                  <span style={{ flex: 1, fontSize: '13px', color: 'var(--paper)' }}>{p?.DisplayName}</span>
                  <input type="number" placeholder="0.00"
                    value={form.customAmounts[uid] || ''}
                    onChange={e => update('customAmounts', { ...form.customAmounts, [uid]: e.target.value })}
                    style={{ ...inputStyle, width: '100px', padding: '6px 10px' }}
                  />
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
           <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: 'var(--r-md)', background: 'rgba(255,255,255,0.05)', color: 'var(--paper)', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
             Cancel
           </button>
           <button type="button" onClick={handleSubmit} disabled={isSubmitting} style={{ flex: 1, padding: '10px', borderRadius: 'var(--r-md)', background: 'var(--accent)', color: 'var(--dark)', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
             {isSubmitting ? 'Saving...' : 'Add Expense'}
           </button>
        </div>

      </div>
    </div>
  );
}
