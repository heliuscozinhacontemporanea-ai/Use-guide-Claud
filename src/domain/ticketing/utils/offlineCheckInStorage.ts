export interface StoredOfflineManifestBundle {
  occurrenceId: string;
  eventListingId: string;
  sessionId: string;
  stationId: string;
  issuedAt: string;
  expiresAt: string;
  publicKeyPem: string;
  tickets: Array<{
    ticketIdHash: string;
    qrVersion: number;
    status: 'issued' | 'checked_in';
  }>;
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
    const tx = db.transaction([STORE_MANIFEST, STORE_USED], 'readwrite');
    tx.objectStore(STORE_MANIFEST).put(bundle);
    const usedStore = tx.objectStore(STORE_USED);
    for (const item of bundle.tickets) {
      if (item.status === 'checked_in') {
        usedStore.put({
          key: `${bundle.occurrenceId}:${item.ticketIdHash}`,
          occurrenceId: bundle.occurrenceId,
          ticketIdHash: item.ticketIdHash,
          usedAt: bundle.issuedAt,
        });
      }
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

export async function recordOfflineCheckInEvent(
  event: StoredOfflineCheckInEvent
): Promise<void> {
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
      resolve(
        occurrenceId ? all.filter((e) => e.occurrenceId === occurrenceId) : all
      );
    };
    req.onerror = () => {
      db.close();
      reject(req.error);
    };
  });
}

export async function removeSyncedOfflineCheckInEvents(
  clientEventIds: string[]
): Promise<void> {
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

function base64UrlToUint8Array(base64Url: string): Uint8Array<ArrayBuffer> {
  const padded = base64Url
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(Math.ceil(base64Url.length / 4) * 4, '=');
  const binary = atob(padded);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN PUBLIC KEY-----/g, '')
    .replace(/-----END PUBLIC KEY-----/g, '')
    .replace(/\s+/g, '');
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function sha256HexBrowser(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyAndConsumeOfflineQrToken(params: {
  rawToken: string;
  occurrenceId: string;
}): Promise<{
  valid: boolean;
  reason?: string;
  event?: StoredOfflineCheckInEvent;
}> {
  const bundle = await getOfflineManifestBundle(params.occurrenceId);
  if (!bundle) {
    return {
      valid: false,
      reason: 'Sessão offline não preparada para esta ocorrência.',
    };
  }

  const nowMs = Date.now();
  if (nowMs > new Date(bundle.expiresAt).getTime()) {
    return {
      valid: false,
      reason: 'A sessão offline expirou. Conecte-se para renovar o manifesto.',
    };
  }

  const trimmed = params.rawToken.trim();
  const parts = trimmed.split('.');
  if (parts.length !== 3 || parts[0] !== 'ugt2') {
    return {
      valid: false,
      reason: 'Formato de QR Code incompatível com verificação criptográfica offline.',
    };
  }

  const payloadB64 = parts[1];
  const signatureB64 = parts[2];
  if (!payloadB64 || !signatureB64) {
    return {
      valid: false,
      reason: 'Formato de QR Code incompatível com verificação criptográfica offline.',
    };
  }

  try {
    const publicKey = await crypto.subtle.importKey(
      'spki',
      pemToArrayBuffer(bundle.publicKeyPem),
      {
        name: 'RSA-PSS',
        hash: 'SHA-256',
      },
      false,
      ['verify']
    );

    const isSignatureValid = await crypto.subtle.verify(
      {
        name: 'RSA-PSS',
        saltLength: 32,
      },
      publicKey,
      base64UrlToUint8Array(signatureB64),
      new TextEncoder().encode(payloadB64)
    );

    if (!isSignatureValid) {
      return {
        valid: false,
        reason: 'Assinatura criptográfica do QR Code inválida ou adulterada.',
      };
    }

    const decodedJson = new TextDecoder().decode(base64UrlToUint8Array(payloadB64));
    const payload = JSON.parse(decodedJson) as {
      v: number;
      tid: string;
      occ: string;
      qrv: number;
      iat: number;
      exp: number;
    };

    const nowSec = Math.floor(nowMs / 1000);
    if (payload.exp < nowSec) {
      return {
        valid: false,
        reason: 'Este QR Code expirou.',
      };
    }

    if (payload.occ !== params.occurrenceId) {
      return {
        valid: false,
        reason: 'Este ingresso pertence a outra sessão/ocorrência do evento.',
      };
    }

    const ticketIdHash = await sha256HexBrowser(payload.tid);
    const manifestEntry = bundle.tickets.find((t) => t.ticketIdHash === ticketIdHash);
    if (!manifestEntry) {
      return {
        valid: false,
        reason: 'Ingresso não consta no manifesto de emitidos desta sessão.',
      };
    }

    if (manifestEntry.qrVersion !== payload.qrv) {
      return {
        valid: false,
        reason: 'Versão do QR Code revogada (ingresso transferido ou reemitido).',
      };
    }

    const alreadyUsed = await isTicketMarkedUsedOffline(
      params.occurrenceId,
      ticketIdHash
    );
    if (alreadyUsed) {
      return {
        valid: false,
        reason: 'Ingresso já utilizado nesta estação.',
      };
    }

    const offlineEvent: StoredOfflineCheckInEvent = {
      clientEventId: crypto.randomUUID(),
      sessionId: bundle.sessionId,
      occurrenceId: params.occurrenceId,
      ticketId: payload.tid,
      ticketIdHash,
      qrVersion: payload.qrv,
      scannedAt: new Date().toISOString(),
      rawToken: trimmed,
    };

    await recordOfflineCheckInEvent(offlineEvent);
    return {
      valid: true,
      event: offlineEvent,
    };
  } catch {
    return {
      valid: false,
      reason: 'Não foi possível verificar a assinatura offline do QR Code.',
    };
  }
}
