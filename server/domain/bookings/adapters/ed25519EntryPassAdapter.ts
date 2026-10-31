import { Ed25519TokenSigner } from '../../../infrastructure/crypto/ed25519TokenSigner';
import type { EntryPassPayload, EntryPassSignerPort } from '../ports/entryPassSignerPort';

/** Prefixo do QR da entrada: separa de qualquer outro token e permite trocar o formato depois. */
export const ENTRY_PASS_PREFIX = 'UGE1';

const signer = new Ed25519TokenSigner({
  prefix: ENTRY_PASS_PREFIX,
  privateKeyEnv: 'BOOKING_ENTRY_QR_PRIVATE_KEY_PEM',
  keyIdEnv: 'BOOKING_ENTRY_QR_KEY_ID',
  previousPublicKeyEnv: 'BOOKING_ENTRY_QR_PREVIOUS_PUBLIC_KEY_PEM',
  previousKeyIdEnv: 'BOOKING_ENTRY_QR_PREVIOUS_KEY_ID',
});

function isPayload(value: unknown): value is EntryPassPayload {
  const p = value as Partial<EntryPassPayload> | null;
  return (
    !!p &&
    p.v === 1 &&
    typeof p.kid === 'string' &&
    typeof p.bid === 'string' &&
    typeof p.sid === 'string' &&
    typeof p.oid === 'string' &&
    typeof p.u === 'number' &&
    (p.nm === undefined || typeof p.nm === 'string') &&
    typeof p.exp === 'number'
  );
}

export class Ed25519EntryPassAdapter implements EntryPassSignerPort {
  sign(payload: Omit<EntryPassPayload, 'kid'>): string {
    return signer.sign(payload);
  }

  verify(token: string): EntryPassPayload | null {
    const payload = signer.verify(token);
    return isPayload(payload) ? payload : null;
  }

  publicKeys(): Array<{ kid: string; publicKeyJwk: JsonWebKey }> {
    return signer.publicKeys();
  }
}

/** Só testes: esquece as chaves lidas para trocar as variáveis de ambiente. */
export function resetEntryPassKeysForTests(): void {
  signer.reset();
}
