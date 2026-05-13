import { useState } from 'react';
import { Search, RefreshCcw } from 'lucide-react';

const TRAVEL_STYLES = [
  { id: 1, value: 'Adventure', label: 'Adventure' },
  { id: 2, value: 'Cultural', label: 'Cultural' },
  { id: 3, value: 'Relaxation', label: 'Relaxation' },
  { id: 4, value: 'Foodie', label: 'Foodie' },
  { id: 5, value: 'Mixed', label: 'Mixed' },
];

const GENDER_OPTIONS = [
  { value: 'any', label: 'Any' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

const GROUP_SIZE_OPTIONS = [
  { value: '1-on-1', label: '1-on-1' },
  { value: 'small-group', label: 'Small Group (2–4)' },
];

const fieldStyle = {
  width: '100%',
  borderRadius: '14px',
  border: '1px solid var(--border)',
  background: 'rgba(255,255,255,0.03)',
  color: 'var(--paper)',
  padding: '13px 14px',
  fontSize: '14px',
  lineHeight: 1.35,
  transition: 'border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease',
  outline: 'none',
};

const labelStyle = {
  display: 'block',
  marginBottom: 8,
  color: 'var(--paper-dim)',
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: 1.4,
  textTransform: 'uppercase',
};

const badgeStyleBase = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  borderRadius: 999,
  padding: '4px 10px',
  border: '1px solid var(--border)',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 0.2,
};

const spinnerStyle = {
  width: 14,
  height: 14,
  borderRadius: '50%',
  border: '2px solid rgba(5,11,20,0.2)',
  borderTopColor: 'var(--ink)',
  flexShrink: 0,
};

/**
 * PreferenceForm — Buddy matching search form.
 * Fields: destination, dates, budget, travel style, age, gender, group size.
 */
export default function PreferenceForm({ form, onChange, onSubmit, onReset, isLoading }) {
  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <label style={labelStyle}>Destination</label>
        <input
          id="destination-autocomplete"
          className="input"
          style={fieldStyle}
          placeholder="e.g. Kyoto, Japan"
          value={form.destination}
          onChange={(e) => onChange('destination', e.target.value)}
          required
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label style={labelStyle}>Start Date</label>
          <input
            className="input"
            style={fieldStyle}
            type="date"
            value={form.startDate}
            onChange={(e) => onChange('startDate', e.target.value)}
            required
          />
        </div>
        <div>
          <label style={labelStyle}>End Date</label>
          <input
            className="input"
            style={fieldStyle}
            type="date"
            value={form.endDate}
            onChange={(e) => onChange('endDate', e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label style={labelStyle}>
          Budget Range ({form.currency}) · {Number(form.budgetMin || 0).toLocaleString()} – {Number(form.budgetMax || 0).toLocaleString()}
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <input
            className="input"
            style={fieldStyle}
            type="number"
            min="0"
            step="100"
            placeholder="Minimum budget"
            value={form.budgetMin}
            onChange={(e) => onChange('budgetMin', e.target.value)}
          />
          <input
            className="input"
            style={fieldStyle}
            type="number"
            min="0"
            step="100"
            placeholder="Maximum budget"
            value={form.budgetMax}
            onChange={(e) => onChange('budgetMax', e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          {['USD', 'PKR'].map((currency) => (
            <button
              key={currency}
              type="button"
              onClick={() => onChange('currency', currency)}
              style={{
                ...badgeStyleBase,
                cursor: 'pointer',
                background: form.currency === currency ? 'rgba(129,236,255,0.12)' : 'rgba(255,255,255,0.03)',
                color: form.currency === currency ? 'var(--accent)' : 'var(--paper-muted)',
                borderColor: form.currency === currency ? 'var(--border-cyan)' : 'var(--border)',
              }}
            >
              {currency}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label style={labelStyle}>Travel Style</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {TRAVEL_STYLES.map((style) => (
            <button
              key={style.value}
              type="button"
              onClick={() => onChange('travelStyleId', style.value)}
              style={{
                ...badgeStyleBase,
                cursor: 'pointer',
                background: form.travelStyleId === style.value ? 'rgba(129,236,255,0.14)' : 'rgba(255,255,255,0.03)',
                color: form.travelStyleId === style.value ? 'var(--accent)' : 'var(--paper-muted)',
                borderColor: form.travelStyleId === style.value ? 'var(--border-cyan)' : 'var(--border)',
              }}
            >
              {style.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <details>
          <summary style={{ ...labelStyle, cursor: 'pointer', listStyle: 'none' }}>
            Age Preference
          </summary>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
            <input
              className="input"
              style={fieldStyle}
              type="number"
              min="18"
              max="90"
              placeholder="Min age"
              value={form.ageMin}
              onChange={(e) => onChange('ageMin', e.target.value)}
            />
            <input
              className="input"
              style={fieldStyle}
              type="number"
              min="18"
              max="90"
              placeholder="Max age"
              value={form.ageMax}
              onChange={(e) => onChange('ageMax', e.target.value)}
            />
          </div>
        </details>
      </div>

      <div>
        <label style={labelStyle}>Gender Preference</label>
        <select
          className="input"
          style={fieldStyle}
          value={form.genderPref}
          onChange={(e) => onChange('genderPref', e.target.value)}
        >
          {GENDER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label style={labelStyle}>Group Size</label>
        <select
          className="input"
          style={fieldStyle}
          value={form.groupSize}
          onChange={(e) => onChange('groupSize', e.target.value)}
        >
          {GROUP_SIZE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading}
          style={{
            flex: 1,
            justifyContent: 'center',
            padding: '14px 18px',
            fontSize: 14,
            borderRadius: 16,
            boxShadow: 'none',
          }}
        >
          {isLoading ? (
            <>
              <span className="spin" style={spinnerStyle} />
              Running Match Engine...
            </>
          ) : (
            <>
              <Search size={15} />
              Find My Buddy
            </>
          )}
        </button>
        <button
          type="button"
          className="btn btn-surface"
          onClick={onReset}
          style={{
            justifyContent: 'center',
            padding: '14px 16px',
            fontSize: 14,
            borderRadius: 16,
          }}
        >
          <RefreshCcw size={15} />
        </button>
      </div>
    </form>
  );
}
