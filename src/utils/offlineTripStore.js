// Feature 11: Offline Mode local IndexedDB helper.
// No external package needed. This avoids requiring idb during the demo stage.

const DB_NAME = 'travelbuddy-offline';
const DB_VERSION = 1;
const STORE_NAME = 'tripBundles';

function openOfflineDb() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB is not supported in this browser'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'tripId' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function runStore(mode, action) {
  return openOfflineDb().then((db) => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);

    let request;
    try {
      request = action(store);
    } catch (err) {
      reject(err);
      return;
    }

    tx.oncomplete = () => resolve(request?.result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  }));
}

export async function saveOfflineTripBundle(tripId, bundle) {
  const record = {
    ...bundle,
    tripId: Number(tripId),
    savedAt: new Date().toISOString(),
  };

  await runStore('readwrite', (store) => store.put(record));
  return record;
}

export async function getOfflineTripBundle(tripId) {
  return runStore('readonly', (store) => store.get(Number(tripId)));
}

export async function deleteOfflineTripBundle(tripId) {
  return runStore('readwrite', (store) => store.delete(Number(tripId)));
}

export async function listOfflineTripBundles() {
  return runStore('readonly', (store) => store.getAll());
}

export function getLastSyncedText(bundle) {
  if (!bundle?.savedAt) return 'Not synced yet';

  const saved = new Date(bundle.savedAt).getTime();
  const diffMs = Date.now() - saved;
  const diffMinutes = Math.max(1, Math.round(diffMs / 60000));

  if (diffMinutes < 60) return `Last synced: ${diffMinutes} min ago`;

  const hours = Math.round(diffMinutes / 60);
  if (hours < 24) return `Last synced: ${hours} hour${hours === 1 ? '' : 's'} ago`;

  const days = Math.round(hours / 24);
  return `Last synced: ${days} day${days === 1 ? '' : 's'} ago`;
}
