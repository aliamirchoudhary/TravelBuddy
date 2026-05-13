import { useEffect }                       from 'react';
import { useParams, useLocation }          from 'react-router-dom';
import useTripStore                        from '../store/tripStore';
import PlannerTopBar                       from '../components/planner/PlannerTopBar';
import PlannerSidebar                      from '../components/planner/PlannerSidebar';
import PlannerBottomNav                    from '../components/planner/PlannerBottomNav';
import DestinationTab                      from '../components/planner/tabs/DestinationTab';
import ItineraryTab                        from '../components/planner/tabs/ItineraryTab';
import BudgetTab                           from '../components/planner/tabs/BudgetTab';
import RoutesTab                           from '../components/planner/tabs/RoutesTab';
import TodoTab                             from '../components/planner/tabs/TodoTab';
import UtilitiesTab                        from '../components/planner/tabs/UtilitiesTab';
import BuddyTab                            from '../components/planner/tabs/BuddyTab';
import DemoPlannerWorkspace                from '../components/planner/DemoPlannerWorkspace';
import SOSButton                           from '../components/emergency/SOSButton';
import api                                 from '../services/api';
import useSocket                           from '../hooks/useSocket';
import { useNavigate }                     from 'react-router-dom';
import DownloadOfflineButton               from '../components/offline/DownloadOfflineButton';

const TAB_COMPONENTS = {
  destination: DestinationTab,
  itinerary:   ItineraryTab,
  budget:      BudgetTab,
  routes:      RoutesTab,
  todo:        TodoTab,
  utilities:   UtilitiesTab,
  buddy:       BuddyTab,
};

export default function TripPlanner() {
  const { tripId }                   = useParams();
  const { state: navState, search }  = useLocation();
  const navigate                     = useNavigate();
  const socket                       = useSocket();
  const { fetchTrip, activeTab, trip, isLoading, error, refreshTrip } = useTripStore();

  const currentUserId = JSON.parse(localStorage.getItem('travelbuddy_user'))?.id;
  const isDemoMode    = navState?.demoMode || new URLSearchParams(search).get('demo') === '1';

  useEffect(() => {
    const id = parseInt(tripId);
    if (!isNaN(id)) fetchTrip(id);
  }, [tripId]);

  // Prefill from Destination Detail (Feature 3)
  useEffect(() => {
    if (!navState || !trip) return;
    if (navState.prefillCity) {
      api.patch(`/trips/${tripId}`, { destinationCityId: navState.prefillCity.id })
        .then(() => refreshTrip());
    }
  }, [navState, !!trip]);

  // Real-time listener
  useEffect(() => {
    if (!socket || !tripId) return;

    socket.emit('join_trip', parseInt(tripId));

    socket.on('trip_updated', ({ updatedBy }) => {
      if (updatedBy !== currentUserId) refreshTrip();
    });

    return () => {
      socket.off('trip_updated');
    };
  }, [socket, tripId, currentUserId]);

  if (isLoading) {
    return (
      <div className="stitch-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="grid-overlay" />
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 10 }}>
          <div
            className="spin"
            style={{
              width: '50px',
              height: '50px',
              border: '3px solid var(--paper-ghost)',
              borderTopColor: 'var(--accent)',
              borderRadius: '50%',
              margin: '0 auto 20px',
              boxShadow: '0 0 20px var(--accent-glow)',
            }}
          />
          <p className="tag" style={{ color: 'var(--accent)', letterSpacing: '4px' }}>
            Initializing Planner
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stitch-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="grid-overlay" />
        <div
          className="bento-card"
          style={{
            padding: '48px',
            textAlign: 'center',
            maxWidth: '400px',
            position: 'relative',
            zIndex: 10,
          }}
        >
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>🛰️</div>
          <h2
            className="display-heading"
            style={{ fontSize: '24px', marginBottom: '12px', color: 'var(--accent2)' }}
          >
            Sync Failed
          </h2>
          <p style={{ color: 'var(--paper-muted)', fontSize: '15px', marginBottom: '32px' }}>
            {error}
          </p>
          <button onClick={() => window.location.href = '/explore'} className="btn btn-primary">
            Return to Base
          </button>
        </div>
      </div>
    );
  }

  if (!tripId) {
    if (isDemoMode) {
      return (
        <div className="stitch-shell">
          <div className="grid-overlay" />
          <div className="stitch-pulse-ring" />

          <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', position: 'relative', zIndex: 20 }}>
            <div
              className="glass"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 24px',
                borderBottom: '1px solid var(--border)',
                background: 'rgba(12,14,17,0.7)',
                gap: '16px',
                flexShrink: 0,
                backdropFilter: 'blur(20px)',
                zIndex: 100,
              }}
            >
              <div>
                <h2 className="display-heading" style={{ margin: 0, fontSize: '20px' }}>
                  Demo Trip Planner
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--paper-muted)', letterSpacing: '0.5px' }}>
                  DATABASE OFFLINE MODE
                </p>
              </div>

              <button className="btn btn-outline" onClick={() => navigate('/explore')}>
                Back to Explore
              </button>
            </div>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              <PlannerSidebar />

              <main style={{ flex: 1, overflowY: 'auto', padding: 'clamp(20px, 4vw, 40px)' }}>
                <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
                  <DemoPlannerWorkspace activeTab={activeTab} />
                </div>
              </main>
            </div>

            <PlannerBottomNav />
          </div>

          {/* SOS always available in demo mode too — uses default 112 */}
          <SOSButton countryName={null} />
        </div>
      );
    }

    return (
      <div className="stitch-shell">
        <div className="grid-overlay" />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            position: 'relative',
            zIndex: 20,
            padding: '40px',
          }}
        >
          <div className="bento-card" style={{ maxWidth: '720px', width: '100%', padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '56px', marginBottom: '18px' }}>🧭</div>

            <h2 className="display-heading" style={{ margin: 0, fontSize: '30px' }}>
              Select a Trip to Continue
            </h2>

            <p style={{ color: 'var(--paper-muted)', margin: '12px 0 28px', lineHeight: 1.6 }}>
              The Trip Planner needs a trip ID to load the planner tabs. Create a trip first, or open an existing one from the trip list.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => navigate('/planner/new')}>
                Create Trip
              </button>

              <button className="btn btn-outline" onClick={() => navigate('/explore')}>
                Browse Destinations
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!trip) return null;

  const ActiveTab = TAB_COMPONENTS[activeTab] || DestinationTab;

  return (
    <div className="stitch-shell">
      <div className="grid-overlay" />
      <div className="stitch-pulse-ring" />

      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', position: 'relative', zIndex: 20 }}>
        <PlannerTopBar />

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <PlannerSidebar />

          <main style={{ flex: 1, overflowY: 'auto', padding: 'clamp(20px, 4vw, 40px)' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  marginBottom: '20px',
                }}
              >
                <DownloadOfflineButton tripId={trip?.TripID || trip?.id || tripId || 1} />
              </div>

              <ActiveTab />
            </div>
          </main>
        </div>

        <PlannerBottomNav />
      </div>

      {/* SOS floating button — always visible on every tab */}
      <SOSButton countryName={trip.CountryName} />
    </div>
  );
}