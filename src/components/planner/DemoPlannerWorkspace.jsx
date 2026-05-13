import { useEffect, useMemo, useState } from 'react';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'PKR', 'JPY', 'TRY', 'AED', 'INR', 'CAD', 'AUD'];

const FX_TO_USD = {
  USD: 1,
  EUR: 1.09,
  GBP: 1.27,
  PKR: 1 / 278.5,
  JPY: 1 / 155,
  TRY: 1 / 32.2,
  AED: 1 / 3.67,
  INR: 1 / 83.1,
  CAD: 1 / 1.36,
  AUD: 1 / 1.53,
};

const DEMO_BUDGET_KEY = 'travelbuddy_demo_budget_v1';

// Bilingual phrases: [English label, Translated phrase]
const LANGUAGE_PHRASES = {
  Japanese: [
    ['Hello', 'Konnichiwa (こんにちは)'],
    ['Thank you', 'Arigatou gozaimasu (ありがとうございます)'],
    ['How much is this?', 'Ikura desu ka? (いくらですか？)'],
    ['Where is the station?', 'Eki wa doko desu ka? (駅はどこですか？)'],
    ['I need help', 'Tasukete kudasai (助けてください)'],
  ],
  Turkish: [
    ['Hello', 'Merhaba'],
    ['Thank you', 'Teşekkür ederim'],
    ['How much is this?', 'Bu ne kadar?'],
    ['Where is the station?', 'İstasyon nerede?'],
    ['I need help', 'Yardım edin lütfen'],
  ],
  Arabic: [
    ['Hello', 'Marhaban (مرحبا)'],
    ['Thank you', 'Shukran (شكراً)'],
    ['How much is this?', 'Bikam hadha? (بكم هذا؟)'],
    ['Where is the station?', 'Ayna almahata? (أين المحطة؟)'],
    ['I need help', 'Ahtaj musaadah (أحتاج مساعدة)'],
  ],
  French: [
    ['Hello', 'Bonjour'],
    ['Thank you', 'Merci beaucoup'],
    ['How much is this?', 'Combien ça coûte?'],
    ['Where is the station?', 'Où est la gare?'],
    ['I need help', "J'ai besoin d'aide"],
  ],
  Spanish: [
    ['Hello', 'Hola'],
    ['Thank you', 'Muchas gracias'],
    ['How much is this?', '¿Cuánto cuesta esto?'],
    ['Where is the station?', '¿Dónde está la estación?'],
    ['I need help', 'Necesito ayuda'],
  ],
  German: [
    ['Hello', 'Hallo'],
    ['Thank you', 'Vielen Dank'],
    ['How much is this?', 'Was kostet das?'],
    ['Where is the station?', 'Wo ist der Bahnhof?'],
    ['I need help', 'Ich brauche Hilfe'],
  ],
};

// Emergency numbers keyed by lowercase country name
const EMERGENCY_BY_COUNTRY = {
  japan:        { police: '110',  ambulance: '119', fire: '119', embassyHint: '+81-3-xxxx-xxxx' },
  pakistan:     { police: '15',   ambulance: '1122', fire: '16', embassyHint: '+92-51-xxxx-xxxx' },
  turkey:       { police: '155',  ambulance: '112', fire: '110', embassyHint: '+90-312-xxx-xxxx' },
  'united kingdom': { police: '999', ambulance: '999', fire: '999', embassyHint: '+44-20-xxxx-xxxx' },
  uk:           { police: '999',  ambulance: '999', fire: '999', embassyHint: '+44-20-xxxx-xxxx' },
  usa:          { police: '911',  ambulance: '911', fire: '911', embassyHint: '+1-202-xxx-xxxx' },
  'united states': { police: '911', ambulance: '911', fire: '911', embassyHint: '+1-202-xxx-xxxx' },
  france:       { police: '17',   ambulance: '15',  fire: '18',  embassyHint: '+33-1-xxxx-xxxx' },
  germany:      { police: '110',  ambulance: '112', fire: '112', embassyHint: '+49-30-xxxx-xxxx' },
  uae:          { police: '999',  ambulance: '998', fire: '997', embassyHint: '+971-2-xxx-xxxx' },
  'united arab emirates': { police: '999', ambulance: '998', fire: '997', embassyHint: '+971-2-xxx-xxxx' },
  india:        { police: '100',  ambulance: '102', fire: '101', embassyHint: '+91-11-xxxx-xxxx' },
  australia:    { police: '000',  ambulance: '000', fire: '000', embassyHint: '+61-2-xxxx-xxxx' },
  canada:       { police: '911',  ambulance: '911', fire: '911', embassyHint: '+1-613-xxx-xxxx' },
  italy:        { police: '113',  ambulance: '118', fire: '115', embassyHint: '+39-06-xxxx-xxxx' },
  spain:        { police: '091',  ambulance: '112', fire: '080', embassyHint: '+34-91-xxx-xxxx' },
};

const DEFAULT_EMERGENCY = { police: '112', ambulance: '112', fire: '112', embassyHint: 'Contact your local embassy' };

function getEmergency(country) {
  if (!country) return DEFAULT_EMERGENCY;
  const key = country.trim().toLowerCase();
  return EMERGENCY_BY_COUNTRY[key] || DEFAULT_EMERGENCY;
}

export default function DemoPlannerWorkspace({ activeTab }) {
  const [destination, setDestination] = useState({
    city: 'Kyoto',
    country: 'Japan',
    startDate: '',
    endDate: '',
    style: 'Cultural',
  });

  const [days, setDays] = useState([
    {
      id: 1,
      label: 'Day 1',
      activities: [
        { slot: 'Morning', title: 'Fushimi Inari visit' },
        { slot: 'Evening', title: 'Gion walk + dinner' },
      ],
    },
  ]);
  const [newActivity, setNewActivity] = useState({ dayId: 1, slot: 'Afternoon', title: '' });

  const [budgetItems, setBudgetItems] = useState([
    { id: 1, category: 'Accommodation', title: 'Hotel', costUsd: 420 },
    { id: 2, category: 'Food',          title: 'Meals', costUsd: 220 },
    { id: 3, category: 'Transport',     title: 'Airport transfer', costUsd: 90 },
  ]);
  const [newBudgetItem, setNewBudgetItem]       = useState({ category: 'Activities', title: '', cost: '' });
  const [budgetCurrency, setBudgetCurrency]     = useState('USD');
  const [splitEnabled, setSplitEnabled]         = useState(false);
  const [manualBudgetTarget, setManualBudgetTarget] = useState('');
  const [budgetSavedAt, setBudgetSavedAt]       = useState('');
  const [isBudgetHydrated, setIsBudgetHydrated] = useState(false);

  const [routes, setRoutes]   = useState([
    { id: 1, from: 'KIX Airport', to: 'Kyoto Hotel', mode: 'train', cost: 35 },
  ]);
  const [newRoute, setNewRoute] = useState({ from: '', to: '', mode: 'train', cost: '' });

  const [todos, setTodos]   = useState([
    { id: 1, text: 'Renew travel insurance', done: false, category: 'Documents' },
    { id: 2, text: 'Pack universal adapter',  done: true,  category: 'Packing' },
  ]);
  const [newTodo, setNewTodo] = useState({ text: '', category: 'General' });

  const [fx, setFx]           = useState({ amount: 100, from: 'USD', to: 'JPY' });
  const [language, setLanguage] = useState('Japanese');

  const [buddies, setBuddies] = useState([
    { id: 1, name: 'Sara Kim',    style: 'Cultural',  status: 'available' },
    { id: 2, name: 'Omar Rashid', style: 'Adventure', status: 'available' },
  ]);

  // ── FX helper ────────────────────────────────────────────────────────────
  function convertCurrency(amount, fromCurrency, toCurrency) {
    const fromRate = FX_TO_USD[fromCurrency] || 1;
    const toRate   = FX_TO_USD[toCurrency]   || 1;
    return (Number(amount || 0) * fromRate) / toRate;
  }

  // ── Budget totals ─────────────────────────────────────────────────────────
  const budgetTotalUsd = useMemo(
    () => budgetItems.reduce((sum, item) => sum + Number(item.costUsd || 0), 0),
    [budgetItems]
  );
  const budgetTotalInCurrency = useMemo(
    () => convertCurrency(budgetTotalUsd, 'USD', budgetCurrency),
    [budgetCurrency, budgetTotalUsd]
  );
  const perPerson  = splitEnabled ? budgetTotalInCurrency / 2 : budgetTotalInCurrency;
  const targetDelta = Number(manualBudgetTarget || 0) - budgetTotalInCurrency;

  const convertedFx = useMemo(
    () => convertCurrency(Number(fx.amount || 0), fx.from, fx.to),
    [fx]
  );

  // ── Emergency numbers — dynamic based on destination country ─────────────
  const emergency = useMemo(() => getEmergency(destination.country), [destination.country]);

  // ── LocalStorage hydration for budget demo ────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DEMO_BUDGET_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (Array.isArray(saved.budgetItems))     setBudgetItems(saved.budgetItems);
      if (saved.budgetCurrency)                  setBudgetCurrency(saved.budgetCurrency);
      if (typeof saved.splitEnabled === 'boolean') setSplitEnabled(saved.splitEnabled);
      if (saved.manualBudgetTarget != null)      setManualBudgetTarget(String(saved.manualBudgetTarget));
      if (saved.budgetSavedAt)                   setBudgetSavedAt(saved.budgetSavedAt);
    } catch { /* keep defaults */ } finally {
      setIsBudgetHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isBudgetHydrated) return;
    try {
      localStorage.setItem(DEMO_BUDGET_KEY, JSON.stringify({
        budgetItems, budgetCurrency, splitEnabled, manualBudgetTarget, budgetSavedAt,
      }));
    } catch { /* no-op */ }
  }, [budgetCurrency, budgetItems, budgetSavedAt, isBudgetHydrated, manualBudgetTarget, splitEnabled]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const addActivity = () => {
    const title = newActivity.title.trim();
    if (!title) return;
    setDays(prev =>
      prev.map(day =>
        day.id === Number(newActivity.dayId)
          ? { ...day, activities: [...day.activities, { slot: newActivity.slot, title }] }
          : day
      )
    );
    setNewActivity(prev => ({ ...prev, title: '' }));
  };

  const addDay = () => {
    const n = days.length + 1;
    setDays(prev => [...prev, { id: n, label: `Day ${n}`, activities: [] }]);
  };

  const addBudgetItem = () => {
    const title = newBudgetItem.title.trim();
    const cost  = Number(newBudgetItem.cost);
    if (!title || !cost) return;
    const costUsd = convertCurrency(cost, budgetCurrency, 'USD');
    setBudgetItems(prev => [
      ...prev,
      { id: Date.now(), category: newBudgetItem.category, title, costUsd },
    ]);
    setNewBudgetItem({ category: 'Activities', title: '', cost: '' });
  };

  const removeBudgetItem = (id) => setBudgetItems(prev => prev.filter(i => i.id !== id));

  const saveManualBudget = () => {
    const amount = Number(manualBudgetTarget || 0);
    if (String(manualBudgetTarget).trim() && (!Number.isFinite(amount) || amount < 0)) return;
    if (!String(manualBudgetTarget).trim()) setManualBudgetTarget(String(Math.round(budgetTotalInCurrency)));
    setBudgetSavedAt(new Date().toISOString());
  };

  const addRoute = () => {
    if (!newRoute.from.trim() || !newRoute.to.trim()) return;
    setRoutes(prev => [...prev, { id: Date.now(), ...newRoute, cost: Number(newRoute.cost || 0) }]);
    setNewRoute({ from: '', to: '', mode: 'train', cost: '' });
  };

  const removeRoute = (id) => setRoutes(prev => prev.filter(r => r.id !== id));

  const addTodo = () => {
    const text = newTodo.text.trim();
    if (!text) return;
    setTodos(prev => [...prev, { id: Date.now(), text, done: false, category: newTodo.category }]);
    setNewTodo({ text: '', category: 'General' });
  };

  const toggleTodo     = (id) => setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const sendBuddyReq   = (id) => setBuddies(prev => prev.map(b => b.id === id ? { ...b, status: 'requested' } : b));

  const copyToClipboard = (val) => { try { navigator.clipboard.writeText(val); } catch {} };

  // ── Card helper ───────────────────────────────────────────────────────────
  const card = (title, body) => (
    <div className="bento-card" style={{ padding: '28px', marginBottom: '20px' }}>
      <h3 className="display-heading" style={{ fontSize: '28px', margin: 0 }}>{title}</h3>
      <p style={{ color: 'var(--paper-muted)', marginTop: '8px', lineHeight: 1.7 }}>{body}</p>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // TAB: DESTINATION
  // ─────────────────────────────────────────────────────────────────────────
  if (activeTab === 'destination') {
    return (
      <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
        {card('Destination Planning', 'Set city, country, travel window, and style. Interactive local mode while DB is offline.')}
        <div className="bento-card" style={{ padding: '28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <input className="input-light" placeholder="City"    value={destination.city}      onChange={e => setDestination(s => ({ ...s, city: e.target.value }))}      style={{ padding: '12px' }} />
            <input className="input-light" placeholder="Country" value={destination.country}   onChange={e => setDestination(s => ({ ...s, country: e.target.value }))}   style={{ padding: '12px' }} />
            <input className="input-light" type="date"           value={destination.startDate} onChange={e => setDestination(s => ({ ...s, startDate: e.target.value }))} style={{ padding: '12px' }} />
            <input className="input-light" type="date"           value={destination.endDate}   onChange={e => setDestination(s => ({ ...s, endDate: e.target.value }))}   style={{ padding: '12px' }} />
            <select className="input-light" value={destination.style} onChange={e => setDestination(s => ({ ...s, style: e.target.value }))} style={{ padding: '12px', gridColumn: 'span 2' }}>
              {['Adventure', 'Cultural', 'Relaxation', 'Foodie', 'Mixed'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TAB: ITINERARY
  // ─────────────────────────────────────────────────────────────────────────
  if (activeTab === 'itinerary') {
    return (
      <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
        {card('Itinerary Planner', 'Build day-by-day activities with morning/afternoon/evening slots.')}
        <div className="bento-card" style={{ padding: '28px', marginBottom: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto auto 1fr auto auto', gap: '10px' }}>
            <select className="input-light" value={newActivity.dayId} onChange={e => setNewActivity(s => ({ ...s, dayId: Number(e.target.value) }))} style={{ padding: '10px' }}>
              {days.map(day => <option key={day.id} value={day.id}>{day.label}</option>)}
            </select>
            <select className="input-light" value={newActivity.slot} onChange={e => setNewActivity(s => ({ ...s, slot: e.target.value }))} style={{ padding: '10px' }}>
              {['Morning', 'Afternoon', 'Evening'].map(slot => <option key={slot}>{slot}</option>)}
            </select>
            <input className="input-light" placeholder="Add activity" value={newActivity.title}
              onChange={e => setNewActivity(s => ({ ...s, title: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && addActivity()} style={{ padding: '10px 12px' }} />
            <button className="btn btn-primary" onClick={addActivity}>Add</button>
            <button className="btn btn-outline" onClick={addDay}>+ Day</button>
          </div>
        </div>
        {days.map(day => (
          <div key={day.id} className="bento-card" style={{ padding: '22px', marginBottom: '14px' }}>
            <div className="tag" style={{ marginBottom: '12px' }}>{day.label}</div>
            {day.activities.length ? day.activities.map((act, idx) => (
              <div key={`${day.id}-${idx}`} style={{ display: 'flex', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--paper-ghost)' }}>
                <span className="badge badge-cyan" style={{ fontSize: '10px', minWidth: '96px', textAlign: 'center' }}>{act.slot}</span>
                <span style={{ color: 'var(--paper)' }}>{act.title}</span>
              </div>
            )) : <p style={{ color: 'var(--paper-dim)', margin: 0 }}>No activities yet.</p>}
          </div>
        ))}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TAB: BUDGET (Feature 6)
  // ─────────────────────────────────────────────────────────────────────────
  if (activeTab === 'budget') {
    return (
      <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
        {card('Budget Planner', 'Track category costs, split totals, and maintain a local estimate while backend is offline.')}

        {/* Totals row */}
        <div className="bento-card" style={{ padding: '28px', marginBottom: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '20px' }}>
            <div>
              <div className="tag">Total</div>
              <div style={{ fontSize: '28px', fontWeight: 900 }}>{budgetCurrency} {budgetTotalInCurrency.toFixed(2)}</div>
            </div>
            <div>
              <div className="tag">Per Person</div>
              <div style={{ fontSize: '28px', fontWeight: 900 }}>{budgetCurrency} {perPerson.toFixed(2)}</div>
            </div>
            <div>
              <div className="tag" style={{ color: targetDelta < 0 ? 'var(--accent2)' : 'var(--accent)' }}>
                {targetDelta < 0 ? 'Over Budget' : 'Remaining'}
              </div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: targetDelta < 0 ? 'var(--accent2)' : 'var(--paper)' }}>
                {budgetCurrency} {Math.abs(targetDelta).toFixed(2)}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <select className="input-light" value={budgetCurrency} onChange={e => setBudgetCurrency(e.target.value)} style={{ padding: '10px' }}>
                {CURRENCIES.map(code => <option key={code}>{code}</option>)}
              </select>
              <button className={splitEnabled ? 'btn btn-primary' : 'btn btn-outline'} onClick={() => setSplitEnabled(v => !v)} style={{ whiteSpace: 'nowrap' }}>
                {splitEnabled ? '👥 Split: ON' : '👥 Split With Buddy'}
              </button>
            </div>
          </div>

          {/* Manual target controls */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '10px', marginBottom: '10px' }}>
            <input className="input-light" type="number" placeholder="Manual budget target" value={manualBudgetTarget}
              onChange={e => setManualBudgetTarget(e.target.value)} style={{ padding: '10px' }} />
            <button className="btn btn-primary" onClick={saveManualBudget} style={{ whiteSpace: 'nowrap' }}>Save Budget</button>
            <button className="btn btn-outline" onClick={() => setManualBudgetTarget(String(Math.round(budgetTotalInCurrency)))} style={{ whiteSpace: 'nowrap' }}>Use Estimate</button>
          </div>
          {budgetSavedAt && (
            <p style={{ margin: '0 0 16px', color: 'var(--paper-dim)', fontSize: '11px' }}>
              Saved locally: {new Date(budgetSavedAt).toLocaleString()}
            </p>
          )}

          {/* Add item form */}
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', gap: '10px', marginBottom: '14px' }}>
            <select className="input-light" value={newBudgetItem.category} onChange={e => setNewBudgetItem(s => ({ ...s, category: e.target.value }))} style={{ padding: '10px' }}>
              {['Accommodation', 'Food', 'Transport', 'Activities', 'Misc'].map(cat => <option key={cat}>{cat}</option>)}
            </select>
            <input className="input-light" placeholder="Description" value={newBudgetItem.title}
              onChange={e => setNewBudgetItem(s => ({ ...s, title: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && addBudgetItem()} style={{ padding: '10px' }} />
            <input className="input-light" type="number" placeholder={`Cost (${budgetCurrency})`} value={newBudgetItem.cost}
              onChange={e => setNewBudgetItem(s => ({ ...s, cost: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && addBudgetItem()} style={{ padding: '10px', width: '120px' }} />
            <button className="btn btn-primary" onClick={addBudgetItem}>Add</button>
          </div>

          {/* Items list */}
          {budgetItems.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--paper-ghost)' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span className="badge badge-cyan" style={{ fontSize: '10px' }}>{item.category}</span>
                <span>{item.title}</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <strong>{budgetCurrency} {convertCurrency(item.costUsd || 0, 'USD', budgetCurrency).toFixed(2)}</strong>
                <button
                  onClick={() => removeBudgetItem(item.id)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--paper-dim)', fontSize: '16px', padding: '2px 6px', borderRadius: '6px' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--accent2)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--paper-dim)'}
                >✕</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TAB: ROUTES (Feature 7)
  // ─────────────────────────────────────────────────────────────────────────
  if (activeTab === 'routes') {
    return (
      <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
        {card('Routes & Transport', 'Add route segments and transport options.')}
        <div className="bento-card" style={{ padding: '28px', marginBottom: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto auto', gap: '10px', marginBottom: '12px' }}>
            <input className="input-light" placeholder="From" value={newRoute.from}
              onChange={e => setNewRoute(s => ({ ...s, from: e.target.value }))} style={{ padding: '10px' }} />
            <input className="input-light" placeholder="To" value={newRoute.to}
              onChange={e => setNewRoute(s => ({ ...s, to: e.target.value }))} style={{ padding: '10px' }} />
            <select className="input-light" value={newRoute.mode}
              onChange={e => setNewRoute(s => ({ ...s, mode: e.target.value }))} style={{ padding: '10px' }}>
              {['flight', 'train', 'bus', 'drive', 'ferry'].map(m => <option key={m}>{m}</option>)}
            </select>
            <input className="input-light" type="number" placeholder="Cost (USD)" value={newRoute.cost}
              onChange={e => setNewRoute(s => ({ ...s, cost: e.target.value }))} style={{ padding: '10px', width: '100px' }} />
            <button className="btn btn-primary" onClick={addRoute}>Add</button>
          </div>
          {routes.map(route => (
            <div key={route.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--paper-ghost)' }}>
              <span>{route.from} → {route.to} <span className="badge badge-cyan" style={{ fontSize: '10px', marginLeft: '8px' }}>{route.mode}</span></span>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <strong>USD {Number(route.cost).toFixed(2)}</strong>
                <button onClick={() => removeRoute(route.id)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--paper-dim)', fontSize: '16px' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--accent2)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--paper-dim)'}>✕</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TAB: TODO (Feature 9)
  // ─────────────────────────────────────────────────────────────────────────
  if (activeTab === 'todo') {
    const doneCount = todos.filter(t => t.done).length;
    return (
      <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
        {card('Travel Checklist', `Stay organised. Completed ${doneCount} of ${todos.length} tasks.`)}
        <div className="bento-card" style={{ padding: '28px', marginBottom: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '10px', marginBottom: '14px' }}>
            <select className="input-light" value={newTodo.category}
              onChange={e => setNewTodo(s => ({ ...s, category: e.target.value }))} style={{ padding: '10px' }}>
              {['General', 'Documents', 'Packing', 'Bookings', 'Health', 'Finance'].map(cat => <option key={cat}>{cat}</option>)}
            </select>
            <input className="input-light" placeholder="Add task…" value={newTodo.text}
              onChange={e => setNewTodo(s => ({ ...s, text: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && addTodo()} style={{ padding: '10px' }} />
            <button className="btn btn-primary" onClick={addTodo}>Add</button>
          </div>
          {todos.map(todo => (
            <label key={todo.id} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--paper-ghost)', cursor: 'pointer' }}>
              <input type="checkbox" checked={todo.done} onChange={() => toggleTodo(todo.id)} />
              <span className="badge badge-cyan" style={{ fontSize: '10px' }}>{todo.category}</span>
              <span style={{ textDecoration: todo.done ? 'line-through' : 'none', opacity: todo.done ? 0.5 : 1, flex: 1 }}>{todo.text}</span>
            </label>
          ))}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TAB: UTILITIES (Feature 8 + 10)
  // ─────────────────────────────────────────────────────────────────────────
  if (activeTab === 'utilities') {
    return (
      <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
        {card('Travel Utilities', `Currency, language, and emergency tools for ${destination.city || 'your destination'}.`)}

        {/* Currency Converter */}
        <div className="bento-card" style={{ padding: '28px', marginBottom: '20px' }}>
          <div className="tag" style={{ marginBottom: '12px' }}>Currency Converter</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '10px', marginBottom: '12px' }}>
            <input className="input-light" type="number" value={fx.amount}
              onChange={e => setFx(s => ({ ...s, amount: e.target.value }))} style={{ padding: '10px' }} />
            <select className="input-light" value={fx.from}
              onChange={e => setFx(s => ({ ...s, from: e.target.value }))} style={{ padding: '10px' }}>
              {CURRENCIES.map(code => <option key={code}>{code}</option>)}
            </select>
            <select className="input-light" value={fx.to}
              onChange={e => setFx(s => ({ ...s, to: e.target.value }))} style={{ padding: '10px' }}>
              {CURRENCIES.map(code => <option key={code}>{code}</option>)}
            </select>
          </div>
          <p style={{ margin: 0, color: 'var(--paper)', fontWeight: 700 }}>
            {Number(fx.amount || 0).toFixed(2)} {fx.from} = <span style={{ color: 'var(--accent)' }}>{Number(convertedFx).toFixed(2)} {fx.to}</span>
          </p>
        </div>

        {/* Language Phrases */}
        <div className="bento-card" style={{ padding: '28px', marginBottom: '20px' }}>
          <div className="tag" style={{ marginBottom: '12px' }}>Language Phrase Helper</div>
          <select className="input-light" value={language}
            onChange={e => setLanguage(e.target.value)} style={{ padding: '10px', marginBottom: '14px', minWidth: '200px' }}>
            {Object.keys(LANGUAGE_PHRASES).map(lang => <option key={lang}>{lang}</option>)}
          </select>
          <div style={{ display: 'grid', gap: '8px' }}>
            {LANGUAGE_PHRASES[language].map(([english, translated], idx) => (
              <div key={`${language}-${idx}`} style={{
                display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'center',
                padding: '10px 14px', background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border)', borderRadius: '10px',
              }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--paper-dim)', marginBottom: '2px' }}>{english}</div>
                  <div style={{ fontWeight: 700 }}>{translated}</div>
                </div>
                <button className="btn btn-outline" style={{ padding: '8px 14px', fontSize: '12px', whiteSpace: 'nowrap' }}
                  onClick={() => copyToClipboard(translated)}>Copy</button>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency — dynamic by destination country */}
        <div className="bento-card" style={{ padding: '28px', borderColor: 'var(--border-cyan)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div className="tag">Emergency Assistance</div>
            <span style={{ fontSize: '12px', color: 'var(--paper-muted)' }}>
              📍 {destination.country || 'Unknown country'} — update Destination tab to change numbers
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '14px' }}>
            {[
              ['🚔 Police',    emergency.police],
              ['🚑 Ambulance', emergency.ambulance],
              ['🔥 Fire',      emergency.fire],
              ['🏛️ Embassy',   emergency.embassyHint],
            ].map(([label, value]) => (
              <div key={label} style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '14px', background: 'rgba(255,255,255,0.03)' }}>
                <div className="tag" style={{ marginBottom: '8px' }}>{label}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  <strong style={{ fontSize: '18px' }}>{value}</strong>
                  <button className="btn btn-outline" style={{ padding: '6px 10px', fontSize: '12px' }}
                    onClick={() => copyToClipboard(String(value))}>Copy</button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => window.location.href = `tel:${emergency.ambulance}`}>
              🚑 Call Ambulance
            </button>
            <button className="btn btn-outline" onClick={() => window.location.href = `tel:${emergency.police}`}>
              🚔 Call Police
            </button>
            <button className="btn btn-outline" onClick={() => window.location.href = `tel:${emergency.fire}`}>
              🔥 Call Fire
            </button>
          </div>
          <p style={{ margin: '12px 0 0', fontSize: '11px', color: 'var(--paper-ghost)' }}>
            ℹ️ Update the Destination tab country to refresh these numbers. Full details in Utilities tab.
          </p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TAB: BUDDY
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
      {card('Buddy Collaboration', 'Browse and invite travel buddies into your trip workspace.')}
      <div className="bento-card" style={{ padding: '28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
          {buddies.map(buddy => (
            <div key={buddy.id} style={{ padding: '18px', borderRadius: '14px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)' }}>
              <div style={{ fontWeight: 700, marginBottom: '6px', fontSize: '16px' }}>{buddy.name}</div>
              <div style={{ color: 'var(--paper-dim)', fontSize: '13px', marginBottom: '12px' }}>{buddy.style} traveler</div>
              {buddy.status === 'requested' ? (
                <span className="badge badge-cyan" style={{ fontSize: '10px' }}>✓ Request Sent</span>
              ) : (
                <button className="btn btn-primary" onClick={() => sendBuddyReq(buddy.id)}>Send Request</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
