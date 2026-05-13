import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import api from '../services/api';

function decodeFallbackPayload(encoded) {
  try {
    const json = decodeURIComponent(escape(atob(encoded)));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export default function SharedTodoView() {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tripName, setTripName] = useState('Shared Trip');
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (token) {
        try {
          const { data } = await api.get(`/shared/todos/${token}`);
          if (cancelled) return;
          setTripName(data.tripName || 'Shared Trip');
          setTodos(Array.isArray(data.todos) ? data.todos : []);
          setError('');
        } catch {
          if (!cancelled) setError('This shared link is invalid or expired.');
        } finally {
          if (!cancelled) setLoading(false);
        }
        return;
      }

      const encoded = searchParams.get('data');
      const fallback = encoded ? decodeFallbackPayload(encoded) : null;
      if (!fallback) {
        if (!cancelled) {
          setError('Shared checklist data was not found.');
          setLoading(false);
        }
        return;
      }

      if (!cancelled) {
        setTripName(fallback.tripName || 'Shared Trip');
        setTodos(Array.isArray(fallback.todos) ? fallback.todos : []);
        setError('');
        setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [token, searchParams]);

  const grouped = useMemo(() => {
    const map = {};
    for (const row of todos) {
      const category = row.Category || row.category || 'General';
      if (!map[category]) map[category] = [];
      map[category].push({
        task: row.Task || row.task || '',
        done: Boolean(row.IsCompleted ?? row.done),
      });
    }
    return map;
  }, [todos]);

  if (loading) {
    return (
      <div style={{ maxWidth: '900px', margin: '48px auto', padding: '0 20px', color: 'var(--paper)' }}>
        <h2 style={{ marginBottom: '8px' }}>Loading shared checklist...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '900px', margin: '48px auto', padding: '0 20px', color: 'var(--paper)' }}>
        <h2 style={{ marginBottom: '8px' }}>Shared Checklist</h2>
        <p style={{ color: 'var(--paper-muted)' }}>{error}</p>
      </div>
    );
  }

  const categories = Object.keys(grouped);

  return (
    <div style={{ maxWidth: '900px', margin: '48px auto', padding: '0 20px', color: 'var(--paper)' }}>
      <h2 style={{ marginBottom: '6px' }}>Shared Checklist</h2>
      <p style={{ color: 'var(--paper-muted)', marginTop: 0, marginBottom: '22px' }}>
        {tripName} • Read-only
      </p>

      {categories.length === 0 && (
        <div className="bento-card" style={{ padding: '20px' }}>
          <p style={{ margin: 0, color: 'var(--paper-muted)' }}>No tasks in this checklist yet.</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {categories.map((category) => (
          <div key={category} className="bento-card" style={{ padding: '18px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '13px', letterSpacing: '1px', textTransform: 'uppercase' }}>
              {category}
            </h3>
            <div style={{ display: 'grid', gap: '8px' }}>
              {grouped[category].map((item, idx) => (
                <div
                  key={`${category}-${idx}`}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    background: item.done ? 'rgba(52,211,153,0.08)' : 'rgba(255,255,255,0.03)',
                    textDecoration: item.done ? 'line-through' : 'none',
                    color: item.done ? 'var(--paper-dim)' : 'var(--paper)',
                  }}
                >
                  {item.task}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
