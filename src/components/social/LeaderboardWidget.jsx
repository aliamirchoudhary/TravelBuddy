import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import api from '../../services/api';

export default function LeaderboardWidget() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get('/gamification/leaderboard');
        setLeaders(res.data);
      } catch (err) {
        console.error('Failed to fetch leaderboard', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="leaderboard-widget animate-pulse">
        <div style={{ height: 20, width: 100, background: 'var(--surface3)', borderRadius: 4, marginBottom: 16 }}></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--surface3)' }}></div>
              <div style={{ flex: 1 }}>
                <div style={{ height: 12, width: '60%', background: 'var(--surface3)', borderRadius: 4, marginBottom: 4 }}></div>
                <div style={{ height: 10, width: '40%', background: 'var(--surface3)', borderRadius: 4 }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (leaders.length === 0) return null;

  return (
    <div className="leaderboard-widget">
      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--paper)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Trophy size={18} className="text-accent" /> Top Travellers
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {leaders.map((user, index) => (
          <Link 
            key={user.UserID} 
            to={`/profile/${user.UserID}`}
            className="leaderboard-row"
          >
            <span style={{ 
              width: 24, 
              fontSize: 12, 
              fontWeight: 800, 
              color: index === 0 ? 'var(--accent5)' : index === 1 ? '#cbd5e1' : index === 2 ? '#92400e' : 'var(--paper-dim)'
            }}>
              #{index + 1}
            </span>
            
            <img 
              src={user.AvatarURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.DisplayName)}&background=random`} 
              alt={user.DisplayName}
              style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--border)' }}
            />
            
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--paper)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.DisplayName}
              </p>
              <p style={{ fontSize: 11, color: 'var(--accent)', margin: 0, fontWeight: 600 }}>
                {user.BadgeCount} Badges
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
