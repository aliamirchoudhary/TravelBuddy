import { CheckCircle, ThumbsUp, Star } from 'lucide-react';
import api from '../../services/api';

export default function ReviewCard({ review, onHelpful }) {
  const stars = Array.from({ length: 5 }, (_, i) => i < review.Rating);

  const markHelpful = async () => {
    await api.post(`/reviews/${review.ReviewID}/helpful`);
    onHelpful?.();
  };

  return (
    <div style={{
      padding: 18,
      borderRadius: 16,
      border: '1px solid rgba(255,253,248,0.08)',
      background: 'rgba(255,253,248,0.04)',
      marginBottom: 14,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
        <div>
          <div style={{ color: 'var(--paper)', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
            {review.Title || 'Travel Review'}
          </div>
          <div style={{ color: 'rgba(247,244,238,0.45)', fontSize: 12 }}>
            by {review.DisplayName || 'Traveller'} · {new Date(review.CreatedAt).toLocaleDateString()}
          </div>
        </div>

        {review.IsVerified && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--accent3)', fontSize: 12, fontWeight: 700 }}>
            <CheckCircle size={14} /> Verified Trip
          </span>
        )}
      </div>

      <div style={{ display: 'flex', gap: 3, marginBottom: 10 }}>
        {stars.map((filled, i) => (
          <Star key={i} size={16} fill={filled ? 'currentColor' : 'none'} style={{ color: filled ? 'var(--accent)' : 'rgba(247,244,238,0.25)' }} />
        ))}
      </div>

      <p style={{ color: 'rgba(247,244,238,0.76)', lineHeight: 1.65, margin: '0 0 12px' }}>
        {review.ReviewText || 'No written review added.'}
      </p>

      <button onClick={markHelpful} style={{
        border: '1px solid rgba(255,253,248,0.12)',
        background: 'rgba(255,253,248,0.04)',
        color: 'rgba(247,244,238,0.7)',
        borderRadius: 999,
        padding: '7px 12px',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 12,
      }}>
        <ThumbsUp size={13} /> Helpful ({review.HelpfulCount || 0})
      </button>
    </div>
  );
}
