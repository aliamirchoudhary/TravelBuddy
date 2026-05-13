import { useEffect, useMemo, useState, useCallback } from 'react';
import useTripStore from '../../../store/tripStore';
import api from '../../../services/api';

const CATEGORIES = ['Accommodation', 'Food', 'Transport', 'Activities', 'Misc'];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'PKR', 'JPY', 'TRY', 'AED', 'INR', 'CAD', 'AUD'];

const FALLBACK_RATES = {
  'USD:PKR': 278.5,  'PKR:USD': 1/278.5,
  'USD:EUR': 0.92,   'EUR:USD': 1/0.92,
  'USD:GBP': 0.79,   'GBP:USD': 1/0.79,
  'USD:JPY': 155,    'JPY:USD': 1/155,
  'USD:TRY': 32.2,   'TRY:USD': 1/32.2,
  'USD:AED': 3.67,   'AED:USD': 1/3.67,
  'USD:INR': 83.1,   'INR:USD': 1/83.1,
  'USD:CAD': 1.36,   'CAD:USD': 1/1.36,
  'USD:AUD': 1.53,   'AUD:USD': 1/1.53,
  'EUR:PKR': 302,    'PKR:EUR': 1/302,
  'GBP:PKR': 352,    'PKR:GBP': 1/352,
};

const CAT_ICONS = {
  Accommodation: '🏨', Food: '🍜', Transport: '✈️', Activities: '🎯', Misc: '📦',
};

// Section override keys → stored in state
const OVERRIDE_KEYS = ['Accommodation', 'Food', 'Transport', 'Activities', 'Misc'];

function formatMoney(amount, currency) {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'USD', maximumFractionDigits: 2 }).format(safeAmount);
  } catch {
    return `${currency || 'USD'} ${safeAmount.toFixed(2)}`;
  }
}

function useToast() {
  const [toast, setToast] = useState(null);
  const show = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);
  return { toast, show };
}

export default function BudgetTab() {
  const { trip, days, routes, budget, budgetItems, hotel, refreshTrip } = useTripStore();
  const { toast, show: showToast } = useToast();

  const [totalInput,     setTotalInput]     = useState('');
  const [miscBuffer,     setMiscBuffer]     = useState(15);
  const [splitWithBuddy, setSplitWithBuddy] = useState(false);
  const [currency,       setCurrency]       = useState('USD');
  const [newItem,        setNewItem]        = useState({ category: 'Accommodation', description: '', estimatedCost: '' });
  const [rateCache,      setRateCache]      = useState({});
  const [isSaving,       setIsSaving]       = useState(false);
  const [isAddingItem,   setIsAddingItem]   = useState(false);
  const [deletingId,     setDeletingId]     = useState(null);

  // Section-level overrides: { Accommodation: '500', Food: '', ... }
  // Empty string = not overridden (use calculated value)
  const [overrides,      setOverrides]      = useState({
    Accommodation: '', Food: '', Transport: '', Activities: '', Misc: '',
  });
  const [editingSection, setEditingSection] = useState(null); // which card is in edit mode
  const overrideStorageKey = `tb_budget_overrides_${trip?.TripID || 'draft'}`;

  useEffect(() => {
    if (!trip?.TripID) return;
    try {
      const raw = localStorage.getItem(overrideStorageKey);
      if (!raw) {
        setOverrides({ Accommodation: '', Food: '', Transport: '', Activities: '', Misc: '' });
        return;
      }
      const saved = JSON.parse(raw);
      setOverrides({
        Accommodation: saved?.Accommodation ?? '',
        Food: saved?.Food ?? '',
        Transport: saved?.Transport ?? '',
        Activities: saved?.Activities ?? '',
        Misc: saved?.Misc ?? '',
      });
    } catch {
      setOverrides({ Accommodation: '', Food: '', Transport: '', Activities: '', Misc: '' });
    }
  }, [overrideStorageKey, trip?.TripID]);

  useEffect(() => {
    if (!trip?.TripID) return;
    try {
      localStorage.setItem(overrideStorageKey, JSON.stringify(overrides));
    } catch {
      // ignore storage errors
    }
  }, [overrideStorageKey, overrides, trip?.TripID]);

  // Sync from loaded budget
  useEffect(() => {
    if (budget?.TotalBudget !== undefined && budget?.TotalBudget !== null) {
      setTotalInput(String(budget.TotalBudget));
    }
    if (budget?.Currency) {
      setCurrency(budget.Currency);
    } else if (trip?.CountryCurrencyCode) {
      setCurrency(trip.CountryCurrencyCode);
    }
  }, [budget?.TotalBudget, budget?.Currency, trip?.CountryCurrencyCode]);

  const getFallbackRate = (base, target) => {
    if (base === target) return 1;
    const direct = FALLBACK_RATES[`${base}:${target}`];
    if (direct) return direct;
    const toUsd   = FALLBACK_RATES[`${base}:USD`] || 1;
    const fromUsd = FALLBACK_RATES[`USD:${target}`] || 1;
    return toUsd * fromUsd;
  };

  // Fetch live rates for currencies in use
  useEffect(() => {
    const sourceCurrencies = new Set([
      ...budgetItems.map(item => item.Currency || budget?.Currency || 'USD'),
      ...routes.map(route => route.Currency || 'USD'),
      ...(days || []).flatMap(day => (Array.isArray(day.Items) ? day.Items : []).map(item => item.Currency || 'USD')),
      trip?.CountryCurrencyCode || budget?.Currency || 'USD',
    ]);
    const pairs = [];
    sourceCurrencies.forEach(source => {
      const key = `${source}:${currency}`;
      if (source !== currency && !rateCache[key]) pairs.push([source, currency]);
    });
    if (!pairs.length) return;
    let cancelled = false;
    (async () => {
      const updates = {};
      for (const [base, target] of pairs) {
        try {
          const { data } = await api.get(`/expenses/rates?base=${base}&target=${target}`);
          updates[`${base}:${target}`] = Number(data.rate || getFallbackRate(base, target));
        } catch {
          updates[`${base}:${target}`] = getFallbackRate(base, target);
        }
      }
      if (!cancelled && Object.keys(updates).length) setRateCache(prev => ({ ...prev, ...updates }));
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency, budgetItems.length, routes.length]);

  const convertAmount = (amount, fromCurrency, toCurrency) => {
    const amt  = Number(amount || 0);
    const from = fromCurrency || 'USD';
    const to   = toCurrency   || 'USD';
    if (from === to) return amt;
    const key  = `${from}:${to}`;
    const rate = rateCache[key] || getFallbackRate(from, to);
    return amt * rate;
  };

  const tripDays = useMemo(() => {
    if (Array.isArray(days) && days.length > 0) return days.length;
    if (trip?.StartDate && trip?.EndDate) {
      const diff = Math.ceil((new Date(trip.EndDate) - new Date(trip.StartDate)) / (1000*60*60*24)) + 1;
      return Number.isFinite(diff) && diff > 0 ? diff : 1;
    }
    return 1;
  }, [days, trip]);

  const activityCost = useMemo(() =>
    (days || []).reduce((dayTotal, day) => {
      const items = Array.isArray(day.Items) ? day.Items : [];
      return dayTotal + items.reduce((t, item) => t + Number(item.Cost || 0), 0);
    }, 0),
  [days]);

  // Calculated breakdown (before overrides)
  const calcBreakdown = useMemo(() => {
    const items = Array.isArray(budgetItems) ? budgetItems : [];
    const bCur  = budget?.Currency || 'USD';
    const sum   = (cat) =>
      items
        .filter(i => i.Category?.toLowerCase() === cat.toLowerCase())
        .reduce((s, i) => s + convertAmount(i.EstimatedCost, i.Currency || bCur, currency), 0);

    // Hotel auto-fill from Destination tab hotel selection
    const hotelCost = hotel?.PricePerNightAvg
      ? convertAmount(Number(hotel.PricePerNightAvg) * tripDays, 'USD', currency)
      : 0;

    const accommodation = sum('accommodation') + hotelCost;
    const food = sum('food') + convertAmount(Number(trip?.CityAvgDailyBudget || 0), trip?.CountryCurrencyCode || bCur, currency) * tripDays;
    const transport = sum('transport') + (routes || []).reduce((s, r) => s + convertAmount(r.EstimatedCost, r.Currency || 'USD', currency), 0);
    const activities = sum('activities') + convertAmount(activityCost, 'USD', currency);
    const miscExplicit = sum('misc');

    return { accommodation, food, transport, activities, misc: miscExplicit };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [budgetItems, currency, rateCache, routes, days, trip, activityCost, tripDays, budget?.Currency, hotel]);

  // Effective values: override takes precedence over calculated
  const effective = useMemo(() => {
    const result = {};
    for (const key of OVERRIDE_KEYS) {
      const ov = overrides[key];
      result[key.toLowerCase()] = (ov !== '' && !isNaN(parseFloat(ov)))
        ? parseFloat(ov)
        : calcBreakdown[key.toLowerCase()] ?? 0;
    }
    return result;
  }, [calcBreakdown, overrides]);

  const subtotal        = Object.values(effective).reduce((s, v) => s + v, 0);
  const buffer          = subtotal * (miscBuffer / 100);
  const estimatedTotal  = subtotal + buffer;
  const manualTarget    = parseFloat(totalInput) || 0;
  const remaining       = manualTarget - estimatedTotal;
  const perPerson       = splitWithBuddy ? estimatedTotal / 2 : estimatedTotal;

  const saveBudget = async () => {
    const amount = Number(totalInput);
    if (!Number.isFinite(amount) || amount < 0) { showToast('Enter a valid budget amount.', 'error'); return; }
    setIsSaving(true);
    try {
      await api.put(`/trips/${trip.TripID}/budget`, { totalBudget: amount, currency });
      await refreshTrip();
      showToast('Budget saved!');
    } catch {
      showToast('Failed to save budget.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const addItem = async () => {
    if (!newItem.estimatedCost || !newItem.description.trim()) { showToast('Fill in a description and cost.', 'error'); return; }
    setIsAddingItem(true);
    try {
      await api.post(`/trips/${trip.TripID}/budget/items`, {
        category: newItem.category, description: newItem.description,
        estimatedCost: parseFloat(newItem.estimatedCost), currency,
      });
      setNewItem({ category: 'Accommodation', description: '', estimatedCost: '' });
      await refreshTrip();
      showToast('Item added!');
    } catch {
      showToast('Failed to add item.', 'error');
    } finally {
      setIsAddingItem(false);
    }
  };

  const deleteItem = async (budgetItemId) => {
    setDeletingId(budgetItemId);
    try {
      await api.delete(`/trips/${trip.TripID}/budget/items/${budgetItemId}`);
      await refreshTrip();
      showToast('Item removed.');
    } catch {
      showToast('Failed to delete item.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const setOverride = (key, val) => setOverrides(prev => ({ ...prev, [key]: val }));
  const clearOverride = (key) => { setOverrides(prev => ({ ...prev, [key]: '' })); setEditingSection(null); };

  const SECTION_DEFS = [
    {
      key: 'Accommodation',
      calc: calcBreakdown.accommodation,
      icon: '🏨',
      sourceHint: hotel
        ? `Auto: ${hotel.HotelName || 'Selected hotel'} (${formatMoney(convertAmount(Number(hotel.PricePerNightAvg || 0), 'USD', currency), currency)}/night × ${tripDays}d)`
        : budgetItems.filter(i => i.Category === 'Accommodation').length > 0
          ? `From ${budgetItems.filter(i => i.Category === 'Accommodation').length} budget item(s)`
          : 'No hotel or items yet',
    },
    {
      key: 'Food',
      calc: calcBreakdown.food,
      icon: '🍜',
      sourceHint: trip?.CityAvgDailyBudget
        ? `Auto: city avg ${formatMoney(convertAmount(Number(trip.CityAvgDailyBudget), trip?.CountryCurrencyCode || 'USD', currency), currency)}/day × ${tripDays}d + items`
        : `From ${budgetItems.filter(i => i.Category === 'Food').length} budget item(s)`,
    },
    {
      key: 'Transport',
      calc: calcBreakdown.transport,
      icon: '✈️',
      sourceHint: routes.length > 0
        ? `Auto: ${routes.length} route(s) + items`
        : `From ${budgetItems.filter(i => i.Category === 'Transport').length} budget item(s)`,
    },
    {
      key: 'Activities',
      calc: calcBreakdown.activities,
      icon: '🎯',
      sourceHint: activityCost > 0
        ? `Auto: itinerary costs + items`
        : `From ${budgetItems.filter(i => i.Category === 'Activities').length} budget item(s)`,
    },
    {
      key: 'Misc',
      calc: calcBreakdown.misc,
      icon: '📦',
      sourceHint: `From ${budgetItems.filter(i => i.Category === 'Misc').length} budget item(s)`,
    },
  ];

  return (
    <div style={{ maxWidth: '1040px', margin: '0 auto', animation: 'fadeUp 0.6s ease', position: 'relative' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
          padding: '14px 22px', borderRadius: '12px', fontWeight: 700, fontSize: '14px',
          background: toast.type === 'error' ? 'rgba(255,115,83,0.95)' : 'rgba(52,211,153,0.95)',
          color: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', animation: 'fadeIn 0.3s ease',
        }}>
          {toast.type === 'error' ? '⚠️' : '✓'} {toast.msg}
        </div>
      )}

      <div style={{ marginBottom: '32px' }}>
        <h3 className="display-heading" style={{ fontSize: '32px', marginBottom: '8px' }}>
          Trip <span className="text-gradient">Budget</span>
        </h3>
        <p style={{ color: 'var(--paper-muted)', fontSize: '15px' }}>
          Live cost estimator — pulls from itinerary, routes, and manual items. Click any section to override.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px' }}>

        {/* ── ESTIMATE HERO ── */}
        <div className="bento-card" style={{ padding: '28px', gridColumn: 'span 12' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
            <div>
              <div className="tag" style={{ marginBottom: '10px' }}>Estimated Trip Cost</div>
              <div style={{ fontSize: '44px', fontWeight: 900, color: 'var(--paper)', lineHeight: 1 }}>
                {formatMoney(estimatedTotal, currency)}
              </div>
              <p style={{ margin: '10px 0 0', color: 'var(--paper-muted)', fontSize: '13px' }}>
                {tripDays} day{tripDays !== 1 ? 's' : ''} · {routes.length} route{routes.length !== 1 ? 's' : ''} · {budgetItems.length} item{budgetItems.length !== 1 ? 's' : ''}
                {Object.values(overrides).some(v => v !== '') && (
                  <span style={{ marginLeft: '10px', color: 'var(--accent)', fontWeight: 700 }}>
                    · {Object.values(overrides).filter(v => v !== '').length} override{Object.values(overrides).filter(v => v !== '').length !== 1 ? 's' : ''} active
                  </span>
                )}
              </p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--paper-dim)', fontWeight: 700, textTransform: 'uppercase' }}>Display Currency</span>
                <select value={currency} onChange={e => setCurrency(e.target.value)} className="input-light" style={{ minWidth: '110px', padding: '10px 14px' }}>
                  {CURRENCIES.map(code => <option key={code} value={code}>{code}</option>)}
                </select>
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--paper-dim)', fontWeight: 700, textTransform: 'uppercase' }}>Misc Buffer %</span>
                <input type="number" min="0" max="100" value={miscBuffer}
                  onChange={e => setMiscBuffer(Math.max(0, Math.min(100, Number(e.target.value || 0))))}
                  className="input-light" style={{ width: '100px', padding: '10px 14px' }} />
              </label>
              <button onClick={() => setSplitWithBuddy(v => !v)} className={splitWithBuddy ? 'btn btn-primary' : 'btn btn-outline'} style={{ padding: '10px 18px' }}>
                {splitWithBuddy ? '👥 Split: ON' : '👥 Split With Buddy'}
              </button>
            </div>
          </div>

          {/* ── SECTION BREAKDOWN WITH EDITABLE OVERRIDES ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '14px' }}>
            {SECTION_DEFS.map(({ key, calc, icon, sourceHint }) => {
              const isEditing  = editingSection === key;
              const hasOverride = overrides[key] !== '' && !isNaN(parseFloat(overrides[key]));
              const displayVal  = hasOverride ? parseFloat(overrides[key]) : calc;

              return (
                <div
                  key={key}
                  style={{
                    padding: '18px', borderRadius: '16px',
                    background: hasOverride ? 'rgba(129,236,255,0.06)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${hasOverride ? 'rgba(129,236,255,0.3)' : 'var(--border)'}`,
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <div style={{ fontSize: '11px', letterSpacing: '1px', color: hasOverride ? 'var(--accent)' : 'var(--paper-dim)', fontWeight: 700, textTransform: 'uppercase' }}>
                      {icon} {key}
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {hasOverride && (
                        <button
                          onClick={() => clearOverride(key)}
                          title="Reset to calculated"
                          style={{
                            background: 'transparent', border: 'none', cursor: 'pointer',
                            color: 'var(--paper-ghost)', fontSize: '11px', padding: '2px 5px', borderRadius: '4px',
                            transition: 'color 0.2s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent2)'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--paper-ghost)'}
                        >
                          ↺
                        </button>
                      )}
                      <button
                        onClick={() => setEditingSection(isEditing ? null : key)}
                        title={isEditing ? 'Done' : 'Override value'}
                        style={{
                          background: 'transparent', border: 'none', cursor: 'pointer',
                          color: isEditing ? 'var(--accent)' : 'var(--paper-ghost)', fontSize: '13px', padding: '2px 5px', borderRadius: '4px',
                          transition: 'color 0.2s',
                        }}
                      >
                        {isEditing ? '✓' : '✏️'}
                      </button>
                    </div>
                  </div>

                  {isEditing ? (
                    <div style={{ marginTop: '6px' }}>
                      <input
                        type="number"
                        autoFocus
                        placeholder={formatMoney(calc, currency)}
                        value={overrides[key]}
                        onChange={e => setOverride(key, e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') setEditingSection(null); if (e.key === 'Escape') clearOverride(key); }}
                        className="input-light"
                        style={{ width: '100%', padding: '8px 10px', fontSize: '16px', fontWeight: 700, boxSizing: 'border-box', marginBottom: '4px' }}
                      />
                      <div style={{ fontSize: '10px', color: 'var(--paper-ghost)' }}>Enter to confirm · Esc to reset</div>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--paper)', marginBottom: '4px' }}>
                        {formatMoney(displayVal, currency)}
                      </div>
                      {hasOverride && (
                        <div style={{ fontSize: '10px', color: 'var(--paper-ghost)', marginBottom: '2px' }}>
                          calc: {formatMoney(calc, currency)}
                        </div>
                      )}
                    </>
                  )}

                  <div style={{ fontSize: '10px', color: 'var(--paper-ghost)', marginTop: '4px', lineHeight: 1.4 }}>
                    {sourceHint}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Buffer / Per Person / Delta */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            <div style={{ padding: '18px', borderRadius: '16px', background: 'rgba(129,236,255,0.07)', border: '1px solid rgba(129,236,255,0.16)' }}>
              <div style={{ fontSize: '11px', letterSpacing: '1px', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase' }}>📦 Misc Buffer ({miscBuffer}%)</div>
              <div style={{ marginTop: '8px', fontSize: '22px', fontWeight: 900, color: 'var(--paper)' }}>{formatMoney(buffer, currency)}</div>
            </div>
            <div style={{ padding: '18px', borderRadius: '16px', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.16)' }}>
              <div style={{ fontSize: '11px', letterSpacing: '1px', color: 'var(--accent3)', fontWeight: 700, textTransform: 'uppercase' }}>👤 Per Person</div>
              <div style={{ marginTop: '8px', fontSize: '22px', fontWeight: 900, color: 'var(--paper)' }}>{formatMoney(perPerson, currency)}</div>
              {splitWithBuddy && <div style={{ fontSize: '11px', color: 'var(--paper-dim)', marginTop: '4px' }}>Split between 2</div>}
            </div>
            <div style={{ padding: '18px', borderRadius: '16px', background: remaining < 0 ? 'rgba(255,115,83,0.08)' : 'rgba(34,197,94,0.08)', border: remaining < 0 ? '1px solid rgba(255,115,83,0.2)' : '1px solid rgba(34,197,94,0.2)' }}>
              <div style={{ fontSize: '11px', letterSpacing: '1px', color: remaining < 0 ? 'var(--accent2)' : 'var(--accent3)', fontWeight: 700, textTransform: 'uppercase' }}>
                {remaining < 0 ? '⚠️ Over Budget' : '✅ Under Budget'}
              </div>
              <div style={{ marginTop: '8px', fontSize: '22px', fontWeight: 900, color: 'var(--paper)' }}>{formatMoney(Math.abs(remaining), currency)}</div>
              {manualTarget > 0 && <div style={{ fontSize: '11px', color: 'var(--paper-dim)', marginTop: '4px' }}>vs {formatMoney(manualTarget, currency)} target</div>}
            </div>
          </div>
        </div>

        {/* ── HOTEL LINKAGE INFO ── */}
        {(hotel || trip?.CityAvgDailyBudget > 0) && (
          <div className="bento-card" style={{ padding: '20px 24px', gridColumn: 'span 12', background: 'rgba(129,236,255,0.04)', borderColor: 'rgba(129,236,255,0.2)', display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '28px', flexShrink: 0 }}>🔗</div>
            <div style={{ flex: 1, minWidth: '260px' }}>
              <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '6px', color: 'var(--accent)' }}>Auto-fill Sources</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '13px', color: 'var(--paper-muted)' }}>
                {hotel && (
                  <span>🏨 <strong style={{ color: 'var(--paper)' }}>{hotel.HotelName || 'Selected hotel'}</strong> · {formatMoney(convertAmount(Number(hotel.PricePerNightAvg || 0), 'USD', currency), currency)}/night × {tripDays} nights = {formatMoney(convertAmount(Number(hotel.PricePerNightAvg || 0) * tripDays, 'USD', currency), currency)} in Accommodation</span>
                )}
                {trip?.CityAvgDailyBudget > 0 && (
                  <span>🍜 City avg {formatMoney(convertAmount(Number(trip.CityAvgDailyBudget), trip?.CountryCurrencyCode || 'USD', currency), currency)}/day × {tripDays} days = {formatMoney(convertAmount(Number(trip.CityAvgDailyBudget) * tripDays, trip?.CountryCurrencyCode || 'USD', currency), currency)} in Food</span>
                )}
                {routes.length > 0 && (
                  <span>✈️ {routes.length} route(s) auto-included in Transport</span>
                )}
                {activityCost > 0 && (
                  <span>🎯 Itinerary activity costs auto-included in Activities</span>
                )}
              </div>
              <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--paper-ghost)' }}>
                Click ✏️ on any section card above to override with a manual value. Click ↺ to revert to auto-calculated.
              </div>
            </div>
          </div>
        )}

        {/* ── BUDGET ITEMS LIST ── */}
        <div className="bento-card" style={{ padding: '28px', gridColumn: 'span 7' }}>
          <div className="tag" style={{ marginBottom: '18px' }}>Budget Items</div>
          {budgetItems.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
              {budgetItems.map(item => (
                <div key={item.BudgetItemID} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: 'var(--surface2)', transition: 'background 0.2s' }}>
                  <span style={{ fontSize: '18px' }}>{CAT_ICONS[item.Category] || '📦'}</span>
                  <span className="badge badge-cyan" style={{ fontSize: '9px', minWidth: '96px', textAlign: 'center', flexShrink: 0 }}>
                    {String(item.Category || 'misc').toUpperCase()}
                  </span>
                  <span style={{ flex: 1, color: 'var(--paper)', fontWeight: 600, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.Description || 'Untitled'}
                  </span>
                  <span style={{ fontWeight: 800, color: 'var(--paper)', flexShrink: 0, fontSize: '15px' }}>
                    {formatMoney(convertAmount(Number(item.EstimatedCost || 0), item.Currency || currency, currency), currency)}
                  </span>
                  <button
                    onClick={() => deleteItem(item.BudgetItemID)}
                    disabled={deletingId === item.BudgetItemID}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--paper-dim)', fontSize: '16px', padding: '4px 8px', borderRadius: '6px', transition: 'color 0.2s, background 0.2s', flexShrink: 0 }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent2)'; e.currentTarget.style.background = 'rgba(255,115,83,0.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--paper-dim)'; e.currentTarget.style.background = 'transparent'; }}
                  >
                    {deletingId === item.BudgetItemID ? '…' : '✕'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--paper-dim)', background: 'var(--surface2)', borderRadius: '14px', border: '1px dashed var(--border)', fontSize: '14px' }}>
              No items yet. Add your first expense below.
            </div>
          )}
          {trip?.CityAvgDailyBudget > 0 && (
            <div style={{ marginTop: '14px', padding: '12px 16px', borderRadius: '10px', background: 'rgba(129,236,255,0.06)', border: '1px solid rgba(129,236,255,0.12)', fontSize: '13px', color: 'var(--paper-muted)' }}>
              ℹ️ Food estimate includes city avg. daily budget of{' '}
              <strong style={{ color: 'var(--accent)' }}>
                {formatMoney(convertAmount(trip.CityAvgDailyBudget, trip.CountryCurrencyCode || 'USD', currency), currency)}
              </strong>{' '}
              × {tripDays} day{tripDays !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* ── MANUAL TARGET ── */}
        <div className="bento-card" style={{ padding: '28px', gridColumn: 'span 5' }}>
          <div className="tag" style={{ marginBottom: '18px' }}>Budget Target</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontWeight: 900, color: 'var(--accent)', fontSize: '13px', letterSpacing: '1px' }}>
                {currency}
              </span>
              <input type="number" value={totalInput} onChange={e => setTotalInput(e.target.value)}
                className="input-light" placeholder="0.00"
                style={{ width: '100%', padding: '16px 16px 16px 68px', fontSize: '22px', fontWeight: 900, borderRadius: '16px', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button onClick={saveBudget} disabled={isSaving} className="btn btn-primary" style={{ padding: '13px 16px' }}>
                {isSaving ? 'Saving…' : '💾 Save Budget'}
              </button>
              <button onClick={() => setTotalInput(String(Math.max(0, Math.round(estimatedTotal))))} className="btn btn-outline" style={{ padding: '13px 16px' }}>
                Use Estimate
              </button>
            </div>

            {/* Planner summary */}
            <div style={{ padding: '16px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--paper-dim)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '12px' }}>Planner Summary</div>
              <div style={{ display: 'grid', gap: '10px', fontSize: '13px', color: 'var(--paper)' }}>
                {[
                  ['Days', tripDays],
                  ['City daily budget', trip?.CityAvgDailyBudget ? formatMoney(convertAmount(Number(trip.CityAvgDailyBudget), trip.CountryCurrencyCode || 'USD', currency), currency) : '—'],
                  ['Routes', routes.length || '—'],
                  ['Activity cost', activityCost ? formatMoney(convertAmount(activityCost, 'USD', currency), currency) : '—'],
                  ['Budget items', budgetItems.length || '—'],
                  ['Hotel', hotel ? `${hotel.HotelName || 'Selected'} · ${formatMoney(convertAmount(Number(hotel.PricePerNightAvg || 0), 'USD', currency), currency)}/night` : '—'],
                  ['Active overrides', Object.values(overrides).filter(v => v !== '').length || '—'],
                ].map(([label, val]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--paper-muted)' }}>{label}</span>
                    <strong>{val}</strong>
                  </div>
                ))}
              </div>
            </div>

            {budget?.UpdatedAt && (
              <p style={{ margin: 0, fontSize: '11px', color: 'var(--paper-ghost)', textAlign: 'center' }}>
                Last saved: {new Date(budget.UpdatedAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* ── ADD ITEM FORM ── */}
        <div className="bento-card" style={{ padding: '28px', gridColumn: 'span 12' }}>
          <div className="tag" style={{ marginBottom: '18px' }}>Add Budget Item</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', gap: '12px', alignItems: 'center' }}>
            <select value={newItem.category} onChange={e => setNewItem(n => ({ ...n, category: e.target.value }))} className="input-light" style={{ padding: '12px 14px' }}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <input
              placeholder="What's this for? (e.g. Hotel 3 nights)"
              value={newItem.description}
              onChange={e => setNewItem(n => ({ ...n, description: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && addItem()}
              className="input-light" style={{ padding: '12px 16px' }}
            />
            <input
              type="number" placeholder={`Cost (${currency})`}
              value={newItem.estimatedCost}
              onChange={e => setNewItem(n => ({ ...n, estimatedCost: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && addItem()}
              className="input-light" style={{ width: '140px', padding: '12px 14px' }}
            />
            <button onClick={addItem} disabled={isAddingItem} className="btn btn-primary" style={{ padding: '12px 24px', whiteSpace: 'nowrap' }}>
              {isAddingItem ? '…' : '+ Add'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
