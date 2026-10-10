import crypto from 'crypto';
import type {
  TicketQrPayload,
  TicketQrTokenPort,
} from '../ports/ticketQrTokenPort';

interface CachedRsaKeys {
  keyId: string;
  privateKeyPem: string;
  publicKeyJwk: JsonWebKey;
}

let cachedRsaKeys: CachedRsaKeys | null = null;

function ensureRsaKeyPair(): CachedRsaKeys {
  if (cachedRsaKeys) {
    return cachedRsaKeys;
  }

  const keyId =
    process.env.OFFLINE_CHECKIN_KEY_ID?.trim() || 'use-guide-rsa-pss-v1';
  const envPem = process.env.OFFLINE_CHECKIN_PRIVATE_KEY_PEM?.trim();

  if (envPem) {
    const normalizedPem = envPem.replace(/\\n/g, '\n');
    const privateKey = crypto.createPrivateKey(normalizedPem);
    const publicKey = crypto.createPublicKey(privateKey);
    const publicKeyJwk = publicKey.export({ format: 'jwk' }) as JsonWebKey;
    cachedRsaKeys = {
      keyId,
      privateKeyPem: normalizedPem,
      publicKeyJwk,
    };
    return cachedRsaKeys;
  }

  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
  });
  const privateKeyPem = privateKey
    .export({ type: 'pkcs8', format: 'pem' })
    .toString();
  const publicKeyJwk = publicKey.export({ format: 'jwk' }) as JsonWebKey;
  cachedRsaKeys = {
    keyId,
    privateKeyPem,
    publicKeyJwk,
  };
  return cachedRsaKeys;
}

export class RsaPssTicketQrTokenAdapter implements TicketQrTokenPort {
  issue(payload: TicketQrPayload): string {
    const { privateKeyPem } = ensureRsaKeyPair();
    const payloadB64 = Buffer.from(JSON.stringify(payload), 'utf8').toString(
      'base64url'
    );
    const signature = crypto.sign('sha256', Buffer.from(payloadB64, 'utf8'), {
      key: privateKeyPem,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
      saltLength: 32,
    });
    return `${payloadB64}.${signature.toString('base64url')}`;
  }

  verify(token: string): TicketQrPayload | null {
    try {
      const trimmed = token.trim();
      const parts = trimmed.split('.');
      if (parts.length !== 2) return null;
      const [payloadB64, sigB64] = parts;
      if (!payloadB64 || !sigB64) return null;

      const { publicKeyJwk } = ensureRsaKeyPair();
      const publicKey = crypto.createPublicKey({
        key: publicKeyJwk,
        format: 'jwk',
      });

      const isValid = crypto.verify(
        'sha256',
        Buffer.from(payloadB64, 'utf8'),
        {
          key: publicKey,
          padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
          saltLength: 32,
        },
        Buffer.from(sigB64, 'base64url')
      );

      if (!isValid) return null;

      const parsed = JSON.parse(
        Buffer.from(payloadB64, 'base64url').toString('utf8')
      ) as TicketQrPayload;

      if (
        parsed.v !== 1 ||
        typeof parsed.ticketId !== 'string' ||
        typeof parsed.occurrenceId !== 'string' ||
        typeof parsed.qrVersion !== 'number' ||
        typeof parsed.iat !== 'number' ||
        typeof parsed.exp !== 'number'
      ) {
        return null;
      }

      const nowSec = Math.floor(Date.now() / 1000);
      if (parsed.exp < nowSec) {
        return null;
      }

      return parsed;
    } catch {
      return null;
    }
  }

  getPublicKeyMetadata(): { keyId: string; publicKeyJwk: JsonWebKey } {
    const { keyId, publicKeyJwk } = ensureRsaKeyPair();
    return { keyId, publicKeyJwk };
  }
}

export function hashTicketIdForOfflineManifest(ticketId: string): string {
  return crypto.createHash('sha256').update(ticketId.trim()).digest('hex');
}
