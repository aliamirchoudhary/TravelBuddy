import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function NewTrip() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const createAndRedirect = async () => {
      try {
        const { data } = await api.post('/trips', {
          tripName: 'My New Trip',
          destinationCityId: location.state?.prefillCity?.id || null
        });
        
        // Pass the prefill state along to the planner
        navigate(`/trip/${data.tripId}`, { 
          state: location.state,
          replace: true 
        });
      } catch (err) {
        console.error('Trip init error:', err);
        toast.error('Trip planner is running in demo mode because the backend database is unavailable.');
        navigate('/TripPlanner?demo=1', {
          replace: true,
          state: { demoMode: true },
        });
      }
    };

    createAndRedirect();
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F8FAFC' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="loader" style={{ marginBottom: '16px' }}></div>
        <p style={{ color: '#64748B', fontWeight: 600 }}>Initializing your adventure...</p>
      </div>
      <style>{`
        .loader {
          width: 40px;
          height: 40px;
          border: 4px solid #E2E8F0;
          border-top-color: #4F46E5;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
