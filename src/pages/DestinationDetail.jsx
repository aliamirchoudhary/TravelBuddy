import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useDestinationStore from '../store/destinationStore';
import DestinationHero from '../components/destination/DestinationHero';
import DestinationTabs from '../components/destination/DestinationTabs';
import DestinationStickyBar from '../components/destination/DestinationStickyBar';
import PageTransition from '../components/PageTransition';
import Footer from '../components/Footer';

export default function DestinationDetail() {
  const { id } = useParams();
  const { fetchCityDetail, city, isLoading, error } = useDestinationStore();

  useEffect(() => {
    if (id) {
      fetchCityDetail(parseInt(id));
    }
  }, [id, fetchCityDetail]);

  if (isLoading) {
    return (
      <div style={{ 
        height: '100vh', display: 'flex', alignItems: 'center', 
        justifyContent: 'center', background: 'var(--ink)', color: 'var(--paper)' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loader" style={{ marginBottom: '20px' }}></div>
          <p style={{ fontFamily: 'var(--font-heading)', letterSpacing: '0.1em', fontSize: '13px', opacity: 0.6 }}>
            PREPARING DESTINATION...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        height: '100vh', display: 'flex', alignItems: 'center', 
        justifyContent: 'center', background: 'var(--ink)', color: 'var(--paper)', padding: '20px'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <h2 style={{ color: 'var(--accent)', marginBottom: '10px' }}>Lost in Transit</h2>
          <p style={{ color: 'var(--muted)', fontSize: '15px' }}>{error}</p>
          <button className="btn btn-outline" onClick={() => window.location.reload()} style={{ marginTop: '20px' }}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!city) return null;

  return (
    <PageTransition>
      <div style={{ background: 'var(--ink)', minHeight: '100vh', paddingBottom: '100px' }}>
        <DestinationHero city={city} />
        <DestinationTabs />
        <DestinationStickyBar city={city} />
        
        <div style={{ marginTop: '60px' }}>
          <Footer />
        </div>
      </div>
    </PageTransition>
  );
}
