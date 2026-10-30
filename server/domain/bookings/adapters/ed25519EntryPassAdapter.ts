import crypto from 'crypto';
import type { EntryPassPayload, EntryPassSignerPort } from '../ports/entryPassSignerPort';

/** Prefixo do QR da entrada: separa de qualquer outro token e permite trocar o formato depois. */
export const ENTRY_PASS_PREFIX = 'UGE1';

interface LoadedKeys {
  kid: string;
  privateKey: crypto.KeyObject;
  verifiers: Array<{ kid: string; publicKey: crypto.KeyObject }>;
}

let loaded: LoadedKeys | null = null;

function readPem(name: string): string | null {
  const value = process.env[name]?.trim();
  return value ? value.replace(/\\n/g, '\n') : null;
}

// Sem chave configurada a entrada não funciona: nunca gerar chave na hora (AGENTS.md §7.7).
function keys(): LoadedKeys {
  if (loaded) return loaded;
  const pem = readPem('BOOKING_ENTRY_QR_PRIVATE_KEY_PEM');
  const kid = process.env.BOOKING_ENTRY_QR_KEY_ID?.trim();
  if (!pem || !kid) {
    throw new Error('BOOKING_ENTRY_QR_PRIVATE_KEY_PEM ou BOOKING_ENTRY_QR_KEY_ID ausente.');
  }
  const privateKey = crypto.createPrivateKey(pem);
  if (privateKey.asymmetricKeyType !== 'ed25519') {
    throw new Error('BOOKING_ENTRY_QR_PRIVATE_KEY_PEM precisa ser uma chave Ed25519.');
  }
  const verifiers = [{ kid, publicKey: crypto.createPublicKey(privateKey) }];
  // Rotação (§7.8): a chave pública anterior vale até o fim das entradas já emitidas com ela.
  const previousPem = readPem('BOOKING_ENTRY_QR_PREVIOUS_PUBLIC_KEY_PEM');
  const previousKid = process.env.BOOKING_ENTRY_QR_PREVIOUS_KEY_ID?.trim();
  if (previousPem && previousKid) {
    verifiers.push({ kid: previousKid, publicKey: crypto.createPublicKey(previousPem) });
  }
  loaded = { kid, privateKey, verifiers };
  return loaded;
}

function isPayload(value: unknown): value is EntryPassPayload {
  const p = value as Partial<EntryPassPayload> | null;
  return (
    !!p &&
    p.v === 1 &&
    typeof p.kid === 'string' &&
    typeof p.bid === 'string' &&
    typeof p.sid === 'string' &&
    typeof p.oid === 'string' &&
    typeof p.n === 'number' &&
    typeof p.exp === 'number'
  );
}

/** Ed25519: assinatura determinística, então o mesmo QR pode ser reemitido sem gravar nada. */
export class Ed25519EntryPassAdapter implements EntryPassSignerPort {
  sign(payload: Omit<EntryPassPayload, 'kid'>): string {
    const { kid, privateKey } = keys();
    const body = Buffer.from(JSON.stringify({ ...payload, kid }), 'utf8').toString('base64url');
    const signature = crypto.sign(null, Buffer.from(body, 'utf8'), privateKey);
    return `${ENTRY_PASS_PREFIX}.${body}.${signature.toString('base64url')}`;
  }

  verify(token: string): EntryPassPayload | null {
    const [prefix, body, signature, extra] = token.trim().split('.');
    if (prefix !== ENTRY_PASS_PREFIX || !body || !signature || extra !== undefined) return null;
    try {
      const payload: unknown = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
      if (!isPayload(payload)) return null;
      const verifier = keys().verifiers.find((candidate) => candidate.kid === payload.kid);
      if (!verifier) return null;
      const valid = crypto.verify(
        null,
        Buffer.from(body, 'utf8'),
        verifier.publicKey,
        Buffer.from(signature, 'base64url')
      );
      return valid ? payload : null;
    } catch {
      return null;
    }
  }

  publicKeys(): Array<{ kid: string; publicKeyJwk: JsonWebKey }> {
    return keys().verifiers.map(({ kid, publicKey }) => ({
      kid,
      publicKeyJwk: publicKey.export({ format: 'jwk' }) as JsonWebKey,
    }));
  }
}

/** Só testes: esquece as chaves lidas para trocar as variáveis de ambiente. */
export function resetEntryPassKeysForTests(): void {
  loaded = null;
}
