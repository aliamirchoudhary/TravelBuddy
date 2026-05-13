import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import ReviewCard from './ReviewCard';

export default function ReviewSection({ entityType = 'city', entityId }) {
  const [sort, setSort] = useState('recent');
  const [summary, setSummary] = useState({ averageRating: 0, reviewCount: 0 });
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({ rating: 5, title: '', reviewText: '' });
  const [loading, setLoading] = useState(false);

  const loadReviews = async () => {
    if (!entityId) return;

    const res = await api.get(`/reviews/${entityType}/${entityId}?sort=${sort}`);

    setSummary(res.data.summary || { averageRating: 0, reviewCount: 0 });
    setReviews(res.data.reviews || []);
  };

  useEffect(() => {
    loadReviews().catch(() => toast.error('Could not load reviews'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityType, entityId, sort]);

  const submitReview = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error('Please enter a review title');
      return;
    }

    if (!form.reviewText.trim()) {
      toast.error('Please write your review');
      return;
    }

    try {
      setLoading(true);

      await api.post('/reviews', {
        entityType,
        entityId,
        rating: Number(form.rating),
        title: form.title.trim(),
        reviewText: form.reviewText.trim(),
      });

      setForm({ rating: 5, title: '', reviewText: '' });
      toast.success('Review posted');

      await loadReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login required to post a review');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    section: {
      marginTop: 42,
      color: 'var(--paper)',
    },

    header: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 16,
      alignItems: 'center',
      marginBottom: 22,
      flexWrap: 'wrap',
    },

    title: {
      color: 'var(--paper)',
      fontFamily: 'var(--font-heading)',
      fontSize: 26,
      fontWeight: 800,
      margin: 0,
    },

    summary: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginTop: 8,
      color: 'rgba(247,244,238,0.62)',
      fontSize: 16,
    },

    star: {
      color: 'var(--accent)',
    },

    sortSelect: {
      width: 180,
      minHeight: 42,
      backgroundColor: '#101418',
      color: 'var(--paper)',
      border: '1px solid rgba(255,255,255,0.14)',
      borderRadius: 12,
      padding: '10px 12px',
      outline: 'none',
      fontSize: 15,
      cursor: 'pointer',
    },

    form: {
      padding: 22,
      borderRadius: 20,
      border: '1px solid rgba(255,255,255,0.09)',
      background: 'linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.025))',
      boxShadow: '0 18px 45px rgba(0,0,0,0.18)',
      marginBottom: 22,
    },

    formRow: {
      display: 'grid',
      gridTemplateColumns: '150px 1fr',
      gap: 14,
      marginBottom: 14,
    },

    input: {
      width: '100%',
      minHeight: 44,
      backgroundColor: '#0f1318',
      color: 'var(--paper)',
      border: '1px solid rgba(255,255,255,0.14)',
      borderRadius: 12,
      padding: '11px 13px',
      outline: 'none',
      fontSize: 15,
      boxSizing: 'border-box',
    },

    textarea: {
      width: '100%',
      minHeight: 120,
      backgroundColor: '#0f1318',
      color: 'var(--paper)',
      border: '1px solid rgba(255,255,255,0.14)',
      borderRadius: 12,
      padding: '13px',
      outline: 'none',
      fontSize: 15,
      resize: 'vertical',
      marginBottom: 14,
      boxSizing: 'border-box',
      fontFamily: 'inherit',
    },

    button: {
      minWidth: 155,
      minHeight: 48,
      border: 'none',
      borderRadius: 999,
      background: 'linear-gradient(135deg, #22d3ee, #06b6d4)',
      color: '#041013',
      fontWeight: 800,
      fontSize: 15,
      cursor: loading ? 'not-allowed' : 'pointer',
      opacity: loading ? 0.7 : 1,
      boxShadow: '0 10px 25px rgba(34,211,238,0.22)',
    },

    emptyText: {
      color: 'rgba(247,244,238,0.52)',
      fontSize: 16,
      marginTop: 20,
    },
  };

  return (
    <section style={styles.section}>
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>Ratings & Reviews</h3>

          <div style={styles.summary}>
            <Star size={18} fill="currentColor" style={styles.star} />
            <strong style={{ color: 'var(--paper)' }}>
              {Number(summary.averageRating || 0).toFixed(1)}
            </strong>
            <span>({summary.reviewCount || 0} reviews)</span>
          </div>
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          style={styles.sortSelect}
        >
          <option value="recent">Most Recent</option>
          <option value="highest">Highest Rated</option>
          <option value="verified">Verified Trips</option>
        </select>
      </div>

      <form onSubmit={submitReview} style={styles.form}>
        <div style={styles.formRow}>
          <select
            value={form.rating}
            onChange={(e) => setForm({ ...form, rating: e.target.value })}
            style={styles.input}
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? 'star' : 'stars'}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Review title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            style={styles.input}
          />
        </div>

        <textarea
          rows={4}
          placeholder="Write your review..."
          value={form.reviewText}
          onChange={(e) => setForm({ ...form, reviewText: e.target.value })}
          style={styles.textarea}
        />

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Posting...' : 'Post Review'}
        </button>
      </form>

      {reviews.length === 0 ? (
        <p style={styles.emptyText}>No reviews yet. Be the first one.</p>
      ) : (
        reviews.map((review) => (
          <ReviewCard
            key={review.ReviewID}
            review={review}
            onHelpful={loadReviews}
          />
        ))
      )}
    </section>
  );
}