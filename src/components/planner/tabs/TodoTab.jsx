import { useState, useCallback, useEffect } from 'react';
import useTripStore from '../../../store/tripStore';
import api from '../../../services/api';

const CATEGORIES = ['General', 'Packing', 'Documents', 'Bookings', 'Health', 'Finance', 'On-the-Day'];

const CAT_ICONS = {
  General: '📋', Packing: '🎒', Documents: '📄',
  Bookings: '🎫', Health: '💊', Finance: '💳', 'On-the-Day': '📅',
};

// ── Templates ────────────────────────────────────────────────────────────────
const TEMPLATES = {
  International: {
    icon: '✈️',
    desc: 'Full international travel checklist',
    items: [
      { category: 'Documents',  task: 'Check passport expiry (6+ months validity)' },
      { category: 'Documents',  task: 'Apply / print visa if required' },
      { category: 'Documents',  task: 'Print travel insurance policy' },
      { category: 'Documents',  task: 'Print hotel & flight confirmations' },
      { category: 'Documents',  task: 'Make copies of all documents (leave with family)' },
      { category: 'Bookings',   task: 'Check in online (24–48h before flight)' },
      { category: 'Bookings',   task: 'Book airport transfer / taxi' },
      { category: 'Bookings',   task: 'Notify bank of travel dates' },
      { category: 'Finance',    task: 'Get local currency / travel card' },
      { category: 'Finance',    task: 'Set travel spending budget' },
      { category: 'Health',     task: 'Check required vaccinations' },
      { category: 'Health',     task: 'Pack prescribed medications (+ extra supply)' },
      { category: 'Health',     task: 'Buy travel insurance' },
      { category: 'Packing',    task: 'Universal power adapter' },
      { category: 'Packing',    task: 'Phone charger & portable power bank' },
      { category: 'Packing',    task: 'Toiletries (100ml limit for carry-on)' },
      { category: 'Packing',    task: 'Appropriate clothing for destination climate' },
      { category: 'On-the-Day', task: 'Set departure alarm (arrive 3h early for international)' },
      { category: 'On-the-Day', task: 'Check airport terminal and gate' },
      { category: 'On-the-Day', task: 'Charge all devices before leaving' },
    ],
  },
  Domestic: {
    icon: '🚗',
    desc: 'Quick domestic trip list',
    items: [
      { category: 'Documents',  task: 'Photo ID / driver\'s license' },
      { category: 'Documents',  task: 'Booking confirmation screenshots' },
      { category: 'Bookings',   task: 'Online check-in if flying' },
      { category: 'Finance',    task: 'Confirm card works at destination' },
      { category: 'Packing',    task: 'Phone charger' },
      { category: 'Packing',    task: 'Toiletries' },
      { category: 'Packing',    task: 'Weather-appropriate clothing' },
      { category: 'On-the-Day', task: 'Set departure alarm' },
      { category: 'On-the-Day', task: 'Check traffic / transport delays' },
    ],
  },
  Beach: {
    icon: '🏖️',
    desc: 'Beach holiday essentials',
    items: [
      { category: 'Packing',    task: 'Sunscreen (SPF 50+)' },
      { category: 'Packing',    task: 'Swimwear (pack 2)' },
      { category: 'Packing',    task: 'Beach towel' },
      { category: 'Packing',    task: 'Sunglasses & sun hat' },
      { category: 'Packing',    task: 'After-sun / aloe vera' },
      { category: 'Packing',    task: 'Waterproof phone pouch' },
      { category: 'Packing',    task: 'Light linen clothing' },
      { category: 'Packing',    task: 'Flip flops & comfortable walking shoes' },
      { category: 'Health',     task: 'Insect repellent' },
      { category: 'Health',     task: 'Antihistamines' },
      { category: 'Documents',  task: 'Travel insurance with water sports cover' },
      { category: 'Bookings',   task: 'Pre-book snorkelling / water activities' },
    ],
  },
  Hiking: {
    icon: '🥾',
    desc: 'Hiking and trail adventure',
    items: [
      { category: 'Packing',    task: 'Hiking boots (broken in)' },
      { category: 'Packing',    task: 'Moisture-wicking base layers' },
      { category: 'Packing',    task: 'Waterproof jacket / poncho' },
      { category: 'Packing',    task: 'Trekking poles' },
      { category: 'Packing',    task: 'Headlamp + extra batteries' },
      { category: 'Packing',    task: 'Navigation (offline maps downloaded)' },
      { category: 'Packing',    task: 'Water bottle / hydration pack (2L+)' },
      { category: 'Packing',    task: 'High-calorie trail snacks' },
      { category: 'Packing',    task: 'First aid kit' },
      { category: 'Health',     task: 'Altitude sickness medication if needed' },
      { category: 'Health',     task: 'Blister plasters' },
      { category: 'Documents',  task: 'Park permits / trail booking confirmations' },
      { category: 'Bookings',   task: 'Emergency contact registered with park authority' },
      { category: 'On-the-Day', task: 'Check weather forecast before setting out' },
      { category: 'On-the-Day', task: 'Share trail plan with someone not on trip' },
    ],
  },
  Business: {
    icon: '💼',
    desc: 'Business travel essentials',
    items: [
      { category: 'Documents',  task: 'Business cards' },
      { category: 'Documents',  task: 'Visa / entry letter if required' },
      { category: 'Documents',  task: 'Meeting agenda / briefing docs' },
      { category: 'Documents',  task: 'Expense claim forms' },
      { category: 'Bookings',   task: 'Confirm meeting room / venue address' },
      { category: 'Bookings',   task: 'Book reliable airport → hotel transfer' },
      { category: 'Finance',    task: 'Corporate card activated for travel' },
      { category: 'Finance',    task: 'Keep all receipts' },
      { category: 'Packing',    task: 'Laptop + charger' },
      { category: 'Packing',    task: 'Presentation clicker / HDMI adapter' },
      { category: 'Packing',    task: 'Formal attire ironed and packed' },
      { category: 'Packing',    task: 'International power adapter' },
      { category: 'On-the-Day', task: 'Confirm meeting time zones' },
      { category: 'On-the-Day', task: 'Download offline maps / transit apps' },
    ],
  },
};

function useToast() {
  const [toast, setToast] = useState(null);
  const show = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  }, []);
  return { toast, show };
}

export default function TodoTab() {
  const { trip, todos, refreshTrip } = useTripStore();
  const { toast, show: showToast }   = useToast();
  const [newTask, setNewTask]        = useState('');
  const [newCat, setNewCat]          = useState('General');
  const [isAdding, setIsAdding]      = useState(false);
  const [deletingId, setDeletingId]  = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [loadingTemplate, setLoadingTemplate] = useState(null);
  const [shareUrl, setShareUrl]      = useState(null);
  const [sharingLoading, setSharingLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [templates, setTemplates] = useState(TEMPLATES);

  useEffect(() => {
    let cancelled = false;
    api.get('/trips/todo-templates')
      .then(({ data }) => {
        if (cancelled) return;
        if (data?.templates && Object.keys(data.templates).length) {
          setTemplates(data.templates);
        }
      })
      .catch(() => {
        if (!cancelled) setTemplates(TEMPLATES);
      });
    return () => { cancelled = true; };
  }, []);

  const addTask = async () => {
    if (!newTask.trim()) return;
    setIsAdding(true);
    try {
      await api.post(`/trips/${trip.TripID}/todos`, { task: newTask.trim(), category: newCat });
      setNewTask('');
      await refreshTrip();
      showToast('Task added!');
    } catch {
      showToast('Failed to add task.', 'error');
    } finally {
      setIsAdding(false);
    }
  };

  const toggle = async (todoId) => {
    try {
      await api.patch(`/trips/${trip.TripID}/todos/${todoId}`);
      await refreshTrip();
    } catch {
      showToast('Failed to update task.', 'error');
    }
  };

  const deleteTask = async (todoId) => {
    setDeletingId(todoId);
    try {
      await api.delete(`/trips/${trip.TripID}/todos/${todoId}`);
      await refreshTrip();
      showToast('Task removed.');
    } catch {
      showToast('Failed to delete task.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  // Load template — bulk insert all items
  const loadTemplate = async (templateName) => {
    const tpl = templates[templateName] || TEMPLATES[templateName];
    if (!tpl) return;
    setLoadingTemplate(templateName);
    try {
      await api.post(`/trips/${trip.TripID}/todos/apply-template`, { templateName });
      await refreshTrip();
      setShowTemplates(false);
      showToast(`${templateName} template loaded (${tpl.items.length} tasks)!`);
    } catch {
      try {
        for (let i = 0; i < tpl.items.length; i++) {
          const item = tpl.items[i];
          await api.post(`/trips/${trip.TripID}/todos`, {
            task: item.task,
            category: item.category,
            sortOrder: i,
          });
        }
        await refreshTrip();
        setShowTemplates(false);
        showToast(`${templateName} template loaded (${tpl.items.length} tasks)!`);
      } catch {
        showToast('Failed to load template.', 'error');
      }
    } finally {
      setLoadingTemplate(null);
    }
  };

  // Share list — generates a read-only token link via backend
  const shareList = async () => {
    setSharingLoading(true);
    try {
      const { data } = await api.post(`/trips/${trip.TripID}/todos/share`);
      const url = `${window.location.origin}/shared/todos/${data.token}`;
      setShareUrl(url);
      setShowShareModal(true);
    } catch {
      // Fallback: encode current todos as base64 URL (client-side read-only share)
      const payload = {
        tripName: trip.TripName || 'Trip',
        todos: todos.map(t => ({ task: t.Task, category: t.Category, done: t.IsCompleted })),
      };
      const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
      const url = `${window.location.origin}/shared/todos?data=${encoded}`;
      setShareUrl(url);
      setShowShareModal(true);
    } finally {
      setSharingLoading(false);
    }
  };

  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    });
  };

  const grouped = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = todos.filter(t => t.Category === cat);
    return acc;
  }, {});

  const totalCount     = todos.length;
  const completedCount = todos.filter(t => t.IsCompleted).length;
  const pct            = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', animation: 'fadeIn 0.8s ease', position: 'relative' }}>

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

      {/* Share modal */}
      {showShareModal && shareUrl && (
        <div
          onClick={() => setShowShareModal(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9998,
            background: 'rgba(0,0,0,0.6)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(6px)',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bento-card"
            style={{ padding: '32px', maxWidth: '520px', width: '90%', position: 'relative' }}
          >
            <button
              onClick={() => setShowShareModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--paper-dim)', fontSize: '20px' }}
            >✕</button>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔗</div>
            <div style={{ fontWeight: 900, fontSize: '18px', marginBottom: '8px' }}>Share Read-Only Checklist</div>
            <p style={{ color: 'var(--paper-muted)', fontSize: '14px', marginBottom: '20px' }}>
              Anyone with this link can view — but not edit — your travel checklist.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                readOnly
                value={shareUrl}
                className="input-light"
                style={{ flex: 1, padding: '12px 14px', fontSize: '13px', boxSizing: 'border-box' }}
                onFocus={e => e.target.select()}
              />
              <button
                onClick={copyShareUrl}
                className="btn btn-primary"
                style={{ padding: '12px 20px', flexShrink: 0 }}
              >
                {copiedShare ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <div style={{ marginTop: '16px', fontSize: '12px', color: 'var(--paper-ghost)' }}>
              ℹ️ Link shows a snapshot. Recipients see current progress but cannot make changes.
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 className="display-heading" style={{ fontSize: '32px', marginBottom: '8px' }}>
            Travel <span className="text-gradient">Checklist</span>
          </h3>
          <p style={{ color: 'var(--paper-muted)', fontSize: '15px', margin: 0 }}>Stay organised and never miss a beat.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowTemplates(v => !v)}
            className="btn btn-outline"
            style={{ padding: '10px 18px', fontSize: '13px' }}
          >
            📋 Templates
          </button>
          {todos.length > 0 && (
            <button
              onClick={shareList}
              disabled={sharingLoading}
              className="btn btn-outline"
              style={{ padding: '10px 18px', fontSize: '13px' }}
            >
              {sharingLoading ? '…' : '🔗 Share'}
            </button>
          )}
        </div>
      </div>

      {/* Template picker */}
      {showTemplates && (
        <div className="bento-card" style={{ padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div className="tag">Load a Template</div>
            <button onClick={() => setShowTemplates(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--paper-dim)', fontSize: '18px' }}>✕</button>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--paper-muted)', marginBottom: '16px', marginTop: 0 }}>
            Adds pre-built tasks to your existing list. Duplicates are allowed — delete any you don't need.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {Object.entries(templates).map(([name, tpl]) => {
              const isLoading = loadingTemplate === name;
              return (
                <button
                  key={name}
                  onClick={() => loadTemplate(name)}
                  disabled={!!loadingTemplate}
                  style={{
                    background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
                    borderRadius: '12px', padding: '18px 16px', cursor: loadingTemplate ? 'default' : 'pointer',
                    textAlign: 'left', transition: 'all 0.2s', opacity: loadingTemplate && !isLoading ? 0.4 : 1,
                  }}
                  onMouseEnter={e => { if (!loadingTemplate) e.currentTarget.style.borderColor = 'var(--border-cyan)'; }}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>{isLoading ? '⏳' : tpl.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '4px', color: 'var(--paper)' }}>{name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--paper-dim)', marginBottom: '8px' }}>{tpl.desc}</div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent)' }}>
                    {isLoading ? 'Loading…' : `${tpl.items.length} tasks →`}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="bento-card" style={{ padding: '20px 28px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--paper-muted)' }}>Overall Progress</span>
            <span style={{ fontSize: '13px', fontWeight: 900, color: pct === 100 ? 'var(--accent3)' : 'var(--accent)' }}>
              {completedCount} / {totalCount} &nbsp;·&nbsp; {pct}%
              {pct === 100 && ' 🎉'}
            </span>
          </div>
          <div style={{ height: '6px', borderRadius: '99px', background: 'var(--surface-light)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '99px', width: `${pct}%`,
              background: pct === 100 ? 'var(--accent3)' : 'var(--grad-cyan)',
              transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
            }} />
          </div>
        </div>
      )}

      {/* Quick add */}
      <div className="bento-card" style={{ padding: '28px', marginBottom: '28px' }}>
        <div className="tag" style={{ marginBottom: '16px' }}>Quick Add</div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <select value={newCat} onChange={e => setNewCat(e.target.value)} className="input-light" style={{ padding: '12px 14px' }}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <input
            placeholder="What needs to be done?"
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTask()}
            className="input-light"
            style={{ flex: 1, minWidth: '200px', padding: '12px 20px', borderRadius: '12px' }}
          />
          <button onClick={addTask} disabled={isAdding} className="btn btn-primary" style={{ padding: '12px 28px' }}>
            {isAdding ? '…' : 'ADD TASK'}
          </button>
        </div>
      </div>

      {/* Category columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {CATEGORIES.map(cat => {
          const items   = grouped[cat] || [];
          const done    = items.filter(i => i.IsCompleted).length;
          const allDone = items.length > 0 && done === items.length;

          return (
            <div
              key={cat}
              className="bento-card"
              style={{
                padding: '22px',
                opacity: items.length === 0 ? 0.45 : 1,
                borderColor: allDone ? 'rgba(52,211,153,0.3)' : undefined,
                transition: 'opacity 0.3s, border-color 0.3s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 900, letterSpacing: '1px', color: allDone ? 'var(--accent3)' : 'var(--accent)', display: 'flex', gap: '7px', alignItems: 'center' }}>
                  <span>{CAT_ICONS[cat]}</span>
                  {cat.toUpperCase()}
                </h4>
                <span style={{ fontSize: '11px', color: 'var(--paper-dim)', fontWeight: 700 }}>{done}/{items.length}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {items.length > 0 ? items.map(todo => (
                  <div
                    key={todo.TodoID}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '11px 14px', borderRadius: '10px',
                      background: todo.IsCompleted ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)',
                      border: '1px solid transparent', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-cyan)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
                  >
                    <div
                      onClick={() => toggle(todo.TodoID)}
                      style={{
                        width: '20px', height: '20px', borderRadius: '6px', flexShrink: 0,
                        border: '2px solid ' + (todo.IsCompleted ? 'var(--accent3)' : 'var(--accent)'),
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        background: todo.IsCompleted ? 'var(--accent3)' : 'transparent', transition: 'all 0.2s',
                      }}
                    >
                      {todo.IsCompleted && <span style={{ color: 'var(--ink)', fontSize: '13px', fontWeight: 900, lineHeight: 1 }}>✓</span>}
                    </div>

                    <span style={{
                      flex: 1, fontSize: '14px', fontWeight: 500,
                      textDecoration: todo.IsCompleted ? 'line-through' : 'none',
                      color: todo.IsCompleted ? 'var(--paper-dim)' : 'var(--paper)',
                      transition: 'all 0.2s',
                    }}>
                      {todo.Task}
                    </span>

                    <button
                      onClick={() => deleteTask(todo.TodoID)}
                      disabled={deletingId === todo.TodoID}
                      style={{
                        background: 'transparent', border: 'none', cursor: 'pointer', flexShrink: 0,
                        color: 'var(--paper-ghost)', fontSize: '15px', padding: '2px 6px', borderRadius: '6px',
                        transition: 'color 0.2s, background 0.2s', opacity: deletingId === todo.TodoID ? 0.4 : 1,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent2)'; e.currentTarget.style.background = 'rgba(255,115,83,0.1)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--paper-ghost)'; e.currentTarget.style.background = 'transparent'; }}
                      title="Remove task"
                    >
                      {deletingId === todo.TodoID ? '…' : '✕'}
                    </button>
                  </div>
                )) : (
                  <div style={{ padding: '18px', textAlign: 'center', color: 'var(--paper-ghost)', fontSize: '13px' }}>
                    No tasks here yet.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
