import crypto from 'crypto';

interface CachedKeyPair {
  keyId: string;
  privateKeyPem: string;
  publicKeyJwk: JsonWebKey;
}

let cachedKeyPair: CachedKeyPair | null = null;

function ensureKeyPair(): CachedKeyPair {
  if (cachedKeyPair) {
    return cachedKeyPair;
  }

  const keyId = process.env.OFFLINE_CHECKIN_KEY_ID?.trim() || 'use-guide-offline-ed25519-v1';
  const envPem = process.env.OFFLINE_CHECKIN_PRIVATE_KEY_PEM?.trim();

  if (envPem) {
    const normalizedPem = envPem.replace(/\\n/g, '\n');
    const privateKey = crypto.createPrivateKey(normalizedPem);
    const publicKey = crypto.createPublicKey(privateKey);
    const publicKeyJwk = publicKey.export({ format: 'jwk' }) as JsonWebKey;
    cachedKeyPair = {
      keyId,
      privateKeyPem: normalizedPem,
      publicKeyJwk,
    };
    return cachedKeyPair;
  }

  const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519');
  const privateKeyPem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
  const publicKeyJwk = publicKey.export({ format: 'jwk' }) as JsonWebKey;
  cachedKeyPair = {
    keyId,
    privateKeyPem,
    publicKeyJwk,
  };
  return cachedKeyPair;
}

export interface OfflineTicketBundlePayload {
  v: 1;
  kid: string;
  tid: string;
  oid: string;
  occ: string;
  ev: string;
  qrh: string;
  iat: number;
  exp: number;
}

export function createSignedOfflineTicketToken(params: {
  ticketId: string;
  orderId: string;
  occurrenceId: string;
  eventListingId: string;
  qrTokenHash: string;
  expiresAtMs?: number;
}): {
  offlineBundleToken: string;
  publicKeyJwk: JsonWebKey;
  keyId: string;
} {
  const { keyId, privateKeyPem, publicKeyJwk } = ensureKeyPair();
  const nowSec = Math.floor(Date.now() / 1000);
  const expSec = params.expiresAtMs
    ? Math.floor(params.expiresAtMs / 1000)
    : nowSec + 30 * 24 * 3600;

  const payload: OfflineTicketBundlePayload = {
    v: 1,
    kid: keyId,
    tid: params.ticketId,
    oid: params.orderId,
    occ: params.occurrenceId,
    ev: params.eventListingId,
    qrh: params.qrTokenHash,
    iat: nowSec,
    exp: expSec,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = crypto.sign(
    null,
    Buffer.from(payloadB64, 'utf8'),
    crypto.createPrivateKey(privateKeyPem)
  );
  const sigB64 = signature.toString('base64url');

  return {
    offlineBundleToken: `ug_off1.${payloadB64}.${sigB64}`,
    publicKeyJwk,
    keyId,
  };
}

export function getOfflineCheckInPublicKeyMetadata(): {
  keyId: string;
  publicKeyJwk: JsonWebKey;
} {
  const { keyId, publicKeyJwk } = ensureKeyPair();
  return { keyId, publicKeyJwk };
}

export function verifySignedOfflineTicketToken(
  token: string,
  nowSec = Math.floor(Date.now() / 1000)
): OfflineTicketBundlePayload {
  const parts = token.trim().split('.');
  if (parts.length !== 3 || parts[0] !== 'ug_off1') {
    throw new Error('Formato de bundle offline inválido.');
  }
  const [, payloadB64, sigB64] = parts;
  if (!payloadB64 || !sigB64) {
    throw new Error('Token offline incompleto.');
  }

  const { publicKeyJwk } = ensureKeyPair();
  const publicKey = crypto.createPublicKey({ key: publicKeyJwk, format: 'jwk' });
  const isValid = crypto.verify(
    null,
    Buffer.from(payloadB64, 'utf8'),
    publicKey,
    Buffer.from(sigB64, 'base64url')
  );

  if (!isValid) {
    throw new Error('Assinatura Ed25519 do ingresso offline inválida.');
  }

  const parsed = JSON.parse(
    Buffer.from(payloadB64, 'base64url').toString('utf8')
  ) as OfflineTicketBundlePayload;

  if (parsed.exp < nowSec) {
    throw new Error('Bundle offline expirado.');
  }

  return parsed;
}
