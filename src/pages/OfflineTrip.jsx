import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Phone, WifiOff } from 'lucide-react';
import { getLastSyncedText, getOfflineTripBundle } from '../utils/offlineTripStore';

export default function OfflineTrip() {
  const { id } = useParams();
  const [bundle, setBundle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const cached = await getOfflineTripBundle(id);
        setBundle(cached || null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const styles = {
    page: {
      minHeight: '100vh',
      padding: '44px 6vw',
      background: '#080c12',
      color: 'var(--paper)',
    },
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      color: '#67e8f9',
      fontWeight: 800,
      marginBottom: 16,
    },
    title: {
      fontSize: 42,
      margin: '0 0 8px',
      fontFamily: 'var(--font-heading)',
    },
    muted: {
      color: 'rgba(247,244,238,0.58)',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
      gap: 18,
      marginTop: 28,
    },
    card: {
      border: '1px solid rgba(255,255,255,0.10)',
      borderRadius: 18,
      padding: 20,
      background: 'rgba(255,255,255,0.035)',
    },
    cardTitle: {
      margin: '0 0 12px',
      fontSize: 20,
    },
    item: {
      borderTop: '1px solid rgba(255,255,255,0.08)',
      paddingTop: 12,
      marginTop: 12,
    },
    map: {
      width: '100%',
      borderRadius: 16,
      border: '1px solid rgba(255,255,255,0.10)',
      marginTop: 12,
    },
  };

  if (loading) {
    return <main style={styles.page}>Loading offline trip...</main>;
  }

  if (!bundle) {
    return (
      <main style={styles.page}>
        <div style={styles.badge}><WifiOff size={18} /> Offline Mode</div>
        <h1 style={styles.title}>No offline bundle found</h1>
        <p style={styles.muted}>Go back to the trip page and click “Download for Offline” first.</p>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.badge}><WifiOff size={18} /> {getLastSyncedText(bundle)}</div>
      <h1 style={styles.title}>{bundle.trip?.TripName || bundle.trip?.title || 'Offline Trip'}</h1>
      <p style={styles.muted}>{bundle.trip?.Destination || bundle.trip?.destination}</p>

      <section style={styles.grid}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Hotel</h2>
          {bundle.hotel ? (
            <>
              <strong>{bundle.hotel.name}</strong>
              <p style={styles.muted}><MapPin size={15} /> {bundle.hotel.address}</p>
              {bundle.hotel.phone && <p style={styles.muted}><Phone size={15} /> {bundle.hotel.phone}</p>}
            </>
          ) : (
            <p style={styles.muted}>No hotel saved in this bundle.</p>
          )}
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Emergency Contacts</h2>
          {(bundle.emergencyContacts || []).map((contact) => (
            <div key={`${contact.label}-${contact.value}`} style={styles.item}>
              <strong>{contact.label}</strong>
              <p style={styles.muted}>{contact.value}</p>
            </div>
          ))}
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Useful Phrases</h2>
          {(bundle.languagePhrases || []).map((phrase) => (
            <div key={phrase.phrase} style={styles.item}>
              <strong>{phrase.phrase}</strong>
              <p style={styles.muted}>{phrase.translation}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={styles.grid}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Itinerary</h2>
          {(bundle.itinerary || []).map((item) => (
            <div key={`${item.day}-${item.title}`} style={styles.item}>
              <strong>Day {item.day}: {item.title}</strong>
              <p style={styles.muted}>{item.location} {item.date ? `• ${item.date}` : ''}</p>
              {item.notes && <p style={styles.muted}>{item.notes}</p>}
            </div>
          ))}
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Restaurants</h2>
          {(bundle.restaurants || []).map((restaurant) => (
            <div key={restaurant.name} style={styles.item}>
              <strong>{restaurant.name}</strong>
              <p style={styles.muted}>{restaurant.cuisine} • {restaurant.address}</p>
            </div>
          ))}
        </div>
      </section>

      {bundle.map?.staticMapUrl && (
        <section style={{ ...styles.card, marginTop: 18 }}>
          <h2 style={styles.cardTitle}>Offline Map Preview</h2>
          <img src={bundle.map.staticMapUrl} alt="Offline map preview" style={styles.map} />
        </section>
      )}
    </main>
  );
}
