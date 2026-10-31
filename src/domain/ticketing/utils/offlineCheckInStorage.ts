export interface StoredOfflineManifestBundle {
  occurrenceId: string;
  eventListingId: string;
  sessionId: string;
  stationId: string;
  issuedAt: string;
  expiresAt: string;
  /** Chaves públicas Ed25519 aceitas (atual e, na rotação, a anterior). */
  keys: Array<{ kid: string; publicKeyJwk: JsonWebKey }>;
  tickets: Array<{ ticketIdHash: string; qrVersion: number }>;
}

export interface StoredOfflineCheckInEvent {
  clientEventId: string;
  sessionId: string;
  occurrenceId: string;
  ticketId: string;
  ticketIdHash: string;
  qrVersion: number;
  scannedAt: string;
  rawToken?: string;
}

const DB_NAME = 'use_guide_offline_checkin_db';
const DB_VERSION = 1;
const STORE_MANIFEST = 'offline_ticket_manifest';
const STORE_EVENTS = 'offline_checkin_events';
const STORE_USED = 'offline_used_tickets';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_MANIFEST)) {
        db.createObjectStore(STORE_MANIFEST, { keyPath: 'occurrenceId' });
      }
      if (!db.objectStoreNames.contains(STORE_EVENTS)) {
        db.createObjectStore(STORE_EVENTS, { keyPath: 'clientEventId' });
      }
      if (!db.objectStoreNames.contains(STORE_USED)) {
        db.createObjectStore(STORE_USED, { keyPath: 'key' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveOfflineManifestBundle(
  bundle: StoredOfflineManifestBundle
): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    // O manifesto só traz ingressos ainda não usados: quem já entrou fica de fora (servidor).
    const tx = db.transaction(STORE_MANIFEST, 'readwrite');
    tx.objectStore(STORE_MANIFEST).put(bundle);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

export async function getOfflineManifestBundle(
  occurrenceId: string
): Promise<StoredOfflineManifestBundle | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_MANIFEST, 'readonly');
    const req = tx.objectStore(STORE_MANIFEST).get(occurrenceId);
    req.onsuccess = () => {
      db.close();
      resolve((req.result as StoredOfflineManifestBundle) || null);
    };
    req.onerror = () => {
      db.close();
      reject(req.error);
    };
  });
}

export async function isTicketMarkedUsedOffline(
  occurrenceId: string,
  ticketIdHash: string
): Promise<boolean> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_USED, 'readonly');
    const req = tx.objectStore(STORE_USED).get(`${occurrenceId}:${ticketIdHash}`);
    req.onsuccess = () => {
      db.close();
      resolve(Boolean(req.result));
    };
    req.onerror = () => {
      db.close();
      reject(req.error);
    };
  });
}

export async function recordOfflineCheckInEvent(event: StoredOfflineCheckInEvent): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_EVENTS, STORE_USED], 'readwrite');
    tx.objectStore(STORE_EVENTS).put(event);
    tx.objectStore(STORE_USED).put({
      key: `${event.occurrenceId}:${event.ticketIdHash}`,
      occurrenceId: event.occurrenceId,
      ticketIdHash: event.ticketIdHash,
      usedAt: event.scannedAt,
    });
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

export async function listPendingOfflineCheckInEvents(
  occurrenceId?: string
): Promise<StoredOfflineCheckInEvent[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_EVENTS, 'readonly');
    const req = tx.objectStore(STORE_EVENTS).getAll();
    req.onsuccess = () => {
      db.close();
      const all = (req.result as StoredOfflineCheckInEvent[]) || [];
      resolve(occurrenceId ? all.filter((e) => e.occurrenceId === occurrenceId) : all);
    };
    req.onerror = () => {
      db.close();
      reject(req.error);
    };
  });
}

export async function removeSyncedOfflineCheckInEvents(clientEventIds: string[]): Promise<void> {
  if (clientEventIds.length === 0) return;
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_EVENTS, 'readwrite');
    const store = tx.objectStore(STORE_EVENTS);
    for (const id of clientEventIds) {
      store.delete(id);
    }
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

export async function sha256HexBrowser(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
