import { Sparkles, Filter } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'compatibility', label: 'Compatibility' },
  { value: 'rating', label: 'Rating' },
  { value: 'trips', label: 'Trips Taken' },
];

const TRAVEL_STYLES = ['Adventure', 'Cultural', 'Relaxation', 'Foodie', 'Mixed'];

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

/**
 * SortFilterBar — Sort and filter controls for buddy search results.
 * Provides sort buttons (compatibility/rating/trips) and style filter pills.
 */
export default function SortFilterBar({
  sortBy,
  onSortChange,
  styleFilter,
  onStyleFilterChange,
  totalMatches,
  visibleMatches,
}) {
  const filters = ['All', ...TRAVEL_STYLES];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        padding: '18px 18px 16px',
        borderRadius: 22,
        border: '1px solid var(--border)',
        background: 'rgba(255,255,255,0.025)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Sparkles size={16} style={{ color: 'var(--accent)' }} />
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 800, color: 'var(--paper)', margin: 0 }}>
              {visibleMatches} Compatible Buddies Found
            </h2>
          </div>
          <p style={{ color: 'var(--paper-dim)', fontSize: 12, margin: 0 }}>
            {totalMatches} total matches before filters · sorted by {SORT_OPTIONS.find((o) => o.value === sortBy)?.label.toLowerCase()}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Filter size={14} style={{ color: 'var(--paper-dim)' }} />
          <span style={{ color: 'var(--paper-dim)', fontSize: 12, fontWeight: 700 }}>Sort by</span>
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onSortChange(option.value)}
              className="btn"
              style={{
                padding: '8px 14px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 800,
                border: '1px solid var(--border)',
                background: sortBy === option.value ? 'rgba(129,236,255,0.14)' : 'transparent',
                color: sortBy === option.value ? 'var(--accent)' : 'var(--paper-muted)',
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {filters.map((filter) => {
          const active = styleFilter === filter;
          return (
            <button
              key={filter}
              type="button"
              onClick={() => onStyleFilterChange(filter)}
              style={{
                ...badgeStyleBase,
                cursor: 'pointer',
                padding: '6px 12px',
                background: active ? 'rgba(129,236,255,0.14)' : 'rgba(255,255,255,0.03)',
                color: active ? 'var(--accent)' : 'var(--paper-muted)',
                borderColor: active ? 'var(--border-cyan)' : 'var(--border)',
              }}
            >
              {filter}
            </button>
          );
        })}
      </div>
    </div>
  );
}
