import useItineraryStore from '../../../store/itineraryStore';

export default function ItineraryActions({ tripId, startDate }) {
  const { save, isSaving, generatedItinerary } = useItineraryStore();

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', gap: '12px' }}>
      <button onClick={handleExportPDF}
        className="btn btn-outline"
        style={{ padding: '10px 24px', fontSize: '13px', borderRadius: '12px' }}>
        📄 EXPORT PDF
      </button>
      <button onClick={() => save(tripId, startDate)} disabled={isSaving || !generatedItinerary}
        className="btn btn-primary"
        style={{ 
          padding: '10px 28px', fontSize: '13px', borderRadius: '12px',
          background: 'var(--accent3)', border: 'none',
          boxShadow: isSaving ? 'none' : '0 4px 15px rgba(52,211,153,0.3)'
        }}>
        {isSaving ? 'SAVING...' : '💾 SAVE ITINERARY'}
      </button>
    </div>
  );
}
