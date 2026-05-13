import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import api from '../../services/api';

const ReviewsList = ({ userId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get(`/users/${userId}/reviews`);
        setReviews(res.data.reviews || []);
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [userId]);

  if (loading) return <div style={{ color: 'var(--muted)', fontSize: 13 }}>Loading reviews...</div>;
  if (!reviews || reviews.length === 0) return <div style={{ color: 'var(--muted)', fontSize: 13 }}>No reviews written yet.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {reviews.map((r, i) => (
        <div key={r.ReviewID || i} style={{ padding: '18px 18px 20px', background: 'var(--surface3)', border: '1px solid var(--border)', borderRadius: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>{r.EntityType === 'city' ? '🏙️' : r.EntityType === 'hotel' ? '🏨' : r.EntityType === 'restaurant' ? '🍽️' : '📸'}</span>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14, color: 'var(--paper)' }}>{r.Title || r.EntityType}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ display: 'flex', gap: 2 }}>
                {[...Array(r.Rating)].map((_, j) => <Star key={j} size={12} fill="#c9a227" style={{ color: '#c9a227' }} />)}
              </div>
              <span style={{ color: 'var(--muted)', fontSize: 11 }}>
                {new Date(r.CreatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.7 }}>{r.ReviewText}</p>
        </div>
      ))}
    </div>
  );
};

export default ReviewsList;
