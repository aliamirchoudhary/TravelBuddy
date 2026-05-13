import { useEffect, useState } from 'react';
import { Download, CheckCircle2, WifiOff, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import {
  deleteOfflineTripBundle,
  getLastSyncedText,
  getOfflineTripBundle,
  saveOfflineTripBundle,
} from '../../utils/offlineTripStore';

export default function DownloadOfflineButton({ tripId, onBundleReady }) {
  const [loading, setLoading] = useState(false);
  const [cachedBundle, setCachedBundle] = useState(null);

  const loadCached = async () => {
    if (!tripId) return;
    try {
      const cached = await getOfflineTripBundle(tripId);
      setCachedBundle(cached || null);
      if (!navigator.onLine && cached && onBundleReady) {
        onBundleReady(cached);
      }
    } catch {
      setCachedBundle(null);
    }
  };

  useEffect(() => {
    loadCached();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  const downloadBundle = async () => {
    if (!tripId) {
      toast.error('Trip id is missing');
      return;
    }

    try {
      setLoading(true);
      const res = await api.get(`/trips/${tripId}/offline-bundle`);
      const saved = await saveOfflineTripBundle(tripId, res.data);
      setCachedBundle(saved);
      if (onBundleReady) onBundleReady(saved);
      toast.success('Trip saved for offline use');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save offline bundle');
    } finally {
      setLoading(false);
    }
  };

  const removeBundle = async () => {
    try {
      await deleteOfflineTripBundle(tripId);
      setCachedBundle(null);
      toast.success('Offline bundle removed');
    } catch {
      toast.error('Could not remove offline bundle');
    }
  };

  const styles = {
    box: {
      border: '1px solid rgba(255,255,255,0.10)',
      borderRadius: 18,
      padding: 18,
      background: 'linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.02))',
      color: 'var(--paper)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      flexWrap: 'wrap',
    },
    title: {
      margin: 0,
      fontSize: 18,
      fontWeight: 800,
    },
    sub: {
      margin: '6px 0 0',
      color: 'rgba(247,244,238,0.58)',
      fontSize: 14,
    },
    actions: {
      display: 'flex',
      gap: 10,
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    button: {
      border: 'none',
      borderRadius: 999,
      padding: '12px 18px',
      background: 'linear-gradient(135deg, #22d3ee, #06b6d4)',
      color: '#041013',
      fontWeight: 800,
      cursor: loading ? 'not-allowed' : 'pointer',
      opacity: loading ? 0.7 : 1,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
    },
    ghost: {
      border: '1px solid rgba(255,255,255,0.14)',
      borderRadius: 999,
      padding: '11px 14px',
      background: 'rgba(255,255,255,0.04)',
      color: 'var(--paper)',
      fontWeight: 700,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
    },
    badge: {
      color: '#67e8f9',
      fontSize: 13,
      fontWeight: 800,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      marginTop: 8,
    },
  };

  return (
    <div style={styles.box}>
      <div>
        <h3 style={styles.title}>Offline Mode</h3>
        <p style={styles.sub}>
          Download itinerary, hotel address, emergency contacts, phrases, and static map preview.
        </p>

        {cachedBundle && (
          <div style={styles.badge}>
            {navigator.onLine ? <CheckCircle2 size={16} /> : <WifiOff size={16} />}
            {getLastSyncedText(cachedBundle)}
          </div>
        )}
      </div>

      <div style={styles.actions}>
        <button type="button" style={styles.button} onClick={downloadBundle} disabled={loading}>
          <Download size={17} />
          {loading ? 'Saving...' : cachedBundle ? 'Refresh Offline' : 'Download for Offline'}
        </button>

        {cachedBundle && (
          <button type="button" style={styles.ghost} onClick={removeBundle}>
            <Trash2 size={16} />
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
