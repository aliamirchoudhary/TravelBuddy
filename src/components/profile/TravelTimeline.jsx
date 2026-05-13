import { Link } from 'react-router-dom';
import TripTimelineCard from './TripTimelineCard';

const TravelTimeline = ({ timeline, isVisible, isOwnProfile }) => {
  if (!isVisible && !isOwnProfile) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', border: '1px dashed var(--border)', borderRadius: 12 }}>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>This user's travel timeline is private.</p>
      </div>
    );
  }

  if (!timeline || timeline.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', border: '1px dashed var(--border)', borderRadius: 12 }}>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>
          {isOwnProfile ? "You haven't started any trips yet." : "This user hasn't completed any trips yet."}
        </p>
        {isOwnProfile && (
          <Link to="/explore" className="btn btn-primary" style={{ marginTop: 12, fontSize: 12 }}>Explore Destinations</Link>
        )}
      </div>
    );
  }

  return (
    <div className="travel-timeline">
      {timeline.map((trip, index) => (
        <TripTimelineCard key={trip.TripID} trip={trip} index={index} />
      ))}
    </div>
  );
};

export default TravelTimeline;
