import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const PrivacyControls = ({ settings, onUpdate }) => {
  const [saving, setSaving] = useState(false);

  const handleToggle = async (key) => {
    try {
      setSaving(true);
      const newSettings = {
        ...settings,
        [key]: !settings[key]
      };
      
      await api.put('/users/me/privacy', {
        showTimeline: newSettings.ShowTimeline,
        showExpenseHistory: newSettings.ShowExpenseHistory,
        showReviews: newSettings.ShowReviews
      });
      
      onUpdate(newSettings);
      toast.success('Privacy settings updated');
    } catch (err) {
      console.error('Failed to update privacy:', err);
      toast.error('Failed to update privacy settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ background: 'var(--surface3)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '18px 18px 20px' }}>
      <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, color: 'var(--paper)', marginBottom: 16 }}>Privacy Settings</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[
          { key: 'ShowTimeline', label: 'Show Travel Timeline' },
          { key: 'ShowReviews', label: 'Show Reviews' },
          { key: 'ShowExpenseHistory', label: 'Show Expense History' }
        ].map(({ key, label }) => (
          <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--paper)' }}>{label}</span>
            <button 
              onClick={() => handleToggle(key)}
              disabled={saving}
              style={{
                width: 36, height: 20, borderRadius: 10,
                background: settings[key] ? 'var(--accent)' : 'var(--surface-light)',
                position: 'relative', cursor: 'pointer', transition: 'background 0.2s',
                opacity: saving ? 0.5 : 1
              }}
            >
              <div style={{
                width: 16, height: 16, borderRadius: '50%', background: 'white',
                position: 'absolute', top: 2, left: settings[key] ? 18 : 2,
                transition: 'left 0.2s'
              }} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrivacyControls;
