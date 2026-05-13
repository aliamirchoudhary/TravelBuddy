import { useEffect }          from 'react';
import useTripStore           from '../../../store/tripStore';
import useItineraryStore      from '../../../store/itineraryStore';
import AIGenerateCard         from '../../planner/itinerary/AIGenerateCard';
import DayAccordion           from '../../planner/itinerary/DayAccordion';
import ItineraryActions       from '../../planner/itinerary/ItineraryActions';
import api                    from '../../../services/api';

export default function ItineraryTab() {
  const { trip }                          = useTripStore();
  const { generatedItinerary, load, fetchRateLimit } = useItineraryStore();

  useEffect(() => {
    if (trip?.TripID) {
      load(trip.TripID);
      fetchRateLimit();
    }
  }, [trip?.TripID]);

  // Calculate duration from dates, or default to 3
  const calculateDays = () => {
    if (!trip?.StartDate || !trip?.EndDate) return 3;
    const start = new Date(trip.StartDate);
    const end   = new Date(trip.EndDate);
    const diff  = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, Math.min(diff, 30)); // Cap at 30 days
  };

  const daysCount = calculateDays();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', animation: 'fadeIn 0.8s ease' }}>
      <div style={{ marginBottom: '32px' }}>
        <h3 className="display-heading" style={{ fontSize: '32px', marginBottom: '8px' }}>
          Plan Your <span className="text-gradient">Adventure</span>
        </h3>
        <p style={{ color: 'var(--paper-muted)', fontSize: '15px' }}>
          Use our AI to craft a perfect journey or build it piece by piece.
        </p>
      </div>

      {/* AI GENERATION SECTION */}
      <div style={{ marginBottom: '48px' }}>
        <AIGenerateCard
          tripId={trip?.TripID}
          cityName={trip?.CityName}
          countryName={trip?.CountryName}
          days={daysCount}
        />
      </div>

      {/* ITINERARY DISPLAY */}
      {generatedItinerary?.days?.length > 0 ? (
        <div style={{ animation: 'fadeUp 0.6s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', padding: '0 8px' }}>
            <div>
              <h4 className="display-heading" style={{ fontSize: '20px', margin: 0 }}>CURRENT TIMELINE</h4>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--paper-dim)', fontWeight: 700, letterSpacing: '1px' }}>
                {generatedItinerary.days.length} DAYS PLANNED
              </p>
            </div>
            <ItineraryActions tripId={trip?.TripID} startDate={trip?.StartDate} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {generatedItinerary.days.map((day, di) => (
              <DayAccordion key={di} day={day} dayIndex={di} />
            ))}
          </div>

          <button 
            onClick={async () => {
              try {
                const num = generatedItinerary.days.length + 1;
                await api.post(`/trips/${trip?.TripID}/days`, { 
                  dayNumber: num, 
                  title: `Day ${num}` 
                });
                load(trip.TripID);
              } catch (err) {
                console.error('Add day error:', err);
                alert('Failed to add day. Please try again.');
              }
            }}
            className="btn btn-outline" 
            style={{ width: '100%', marginTop: '32px', padding: '16px', borderRadius: '16px', borderStyle: 'dashed' }}
          >
            + ADD ANOTHER DAY MANUALLY
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="bento-card" style={{ textAlign: 'center', padding: '80px 40px', borderStyle: 'dashed', opacity: 0.8 }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🧭</div>
            <h4 style={{ margin: '0 0 12px', fontSize: '18px', fontWeight: 900 }}>NO ITINERARY YET</h4>
            <p style={{ color: 'var(--paper-dim)', fontSize: '14px', maxWidth: '350px', margin: '0 auto' }}>
              Configure your preferences above and click Generate to see our AI build your dream trip in seconds.
            </p>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--paper-dim)', fontSize: '12px', marginBottom: '12px' }}>OR PREFER TO BUILD IT YOURSELF?</p>
            <button 
              onClick={async () => {
                try {
                  await api.post(`/trips/${trip?.TripID}/days`, { 
                    dayNumber: 1, 
                    title: 'Day 1' 
                  });
                  load(trip.TripID);
                } catch (err) {
                  console.error('Manual plan error:', err);
                  alert('Failed to start manual plan. Please try again.');
                }
              }}
              className="btn btn-surface" 
              style={{ padding: '12px 32px', borderRadius: '30px' }}
            >
              START MANUAL PLAN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
