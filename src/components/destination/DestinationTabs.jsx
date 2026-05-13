import useDestinationStore from '../../store/destinationStore';
import PlaceCardGrid       from './PlaceCardGrid';
import ReviewSection from '../reviews/ReviewSection';

const TABS = ['overview', 'hotels', 'restaurants', 'attractions', 'reviews'];

export default function DestinationTabs() {
  const { activeTab, setActiveTab, city, hotels, restaurants, attractions } = useDestinationStore();

  return (
    <div className="container" style={{ marginTop: '24px' }}>
      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid rgba(255,253,248,0.1)', marginBottom: '32px' }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{
              padding: '14px 24px', border: 'none', cursor: 'pointer', background: 'none',
              fontWeight: 700,
              fontFamily: 'var(--font-heading)',
              fontSize: '14px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: activeTab === tab ? 'var(--accent)' : 'var(--muted)',
              borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
              transition: 'all 0.2s',
              marginBottom: '-1px'
            }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ minHeight: '400px' }}>
        {activeTab === 'overview' && (
          <div style={{ maxWidth: '800px' }}>
            <p style={{ fontSize: '17px', lineHeight: 1.8, color: 'rgba(247,244,238,0.8)', marginBottom: '24px' }}>
              {city?.Description}
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              {city?.VisaInfoText && (
                <div style={{ background: 'rgba(201,162,39,0.05)', border: '1px solid rgba(201,162,39,0.2)', borderRadius: '12px', padding: '18px' }}>
                  <h4 style={{ color: '#c9a227', fontSize: '12px', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 700 }}>🛂 Visa Information</h4>
                  <p style={{ color: 'var(--paper)', fontSize: '14px', margin: 0 }}>{city.VisaInfoText}</p>
                </div>
              )}
              
              <div style={{ background: 'rgba(31,138,85,0.05)', border: '1px solid rgba(31,138,85,0.2)', borderRadius: '12px', padding: '18px' }}>
                <h4 style={{ color: 'var(--accent3)', fontSize: '12px', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 700 }}>💰 Currency</h4>
                <p style={{ color: 'var(--paper)', fontSize: '14px', margin: 0 }}>
                  {city?.CurrencyName ? `${city.CurrencyName} (${city.CurrencySymbol || city.CurrencyCode})` : `Local currency is ${city?.CurrencyCode || 'N/A'}`}.
                </p>
              </div>
            </div>
          </div>
        )}
        <div style={{ minHeight: '400px' }}>
  {activeTab === 'overview' && (
    <div style={{ maxWidth: '800px' }}>
      <p style={{ fontSize: '17px', lineHeight: 1.8, color: 'rgba(247,244,238,0.8)', marginBottom: '24px' }}>
        {city?.Description}
      </p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        {city?.VisaInfoText && (
          <div style={{ background: 'rgba(201,162,39,0.05)', border: '1px solid rgba(201,162,39,0.2)', borderRadius: '12px', padding: '18px' }}>
            <h4 style={{ color: '#c9a227', fontSize: '12px', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 700 }}>🛂 Visa Information</h4>
            <p style={{ color: 'var(--paper)', fontSize: '14px', margin: 0 }}>{city.VisaInfoText}</p>
          </div>
        )}
        
        <div style={{ background: 'rgba(31,138,85,0.05)', border: '1px solid rgba(31,138,85,0.2)', borderRadius: '12px', padding: '18px' }}>
          <h4 style={{ color: 'var(--accent3)', fontSize: '12px', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 700 }}>💰 Currency</h4>
          <p style={{ color: 'var(--paper)', fontSize: '14px', margin: 0 }}>
            {city?.CurrencyName ? `${city.CurrencyName} (${city.CurrencySymbol || city.CurrencyCode})` : `Local currency is ${city?.CurrencyCode || 'N/A'}`}.
          </p>
        </div>
      </div>
    </div>
  )}

  {activeTab === 'reviews' && (
    <ReviewSection entityType="city" entityId={city?.CityID} />
  )}
</div>

        {activeTab === 'hotels'      && <PlaceCardGrid items={hotels}      type="hotel"      />}
        {activeTab === 'restaurants' && <PlaceCardGrid items={restaurants} type="restaurant" />}
        {activeTab === 'attractions' && <PlaceCardGrid items={attractions} type="attraction" />}
      </div>
    </div>
  );
}
