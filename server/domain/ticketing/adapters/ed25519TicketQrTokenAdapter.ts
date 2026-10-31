import { Ed25519TokenSigner } from '../../../infrastructure/crypto/ed25519TokenSigner';
import type { TicketQrPayload, TicketQrTokenPort } from '../ports/ticketQrTokenPort';

/** Prefixo do QR do ingresso: separa da entrada de atração (`UGE1`) e de tokens antigos. */
export const TICKET_QR_PREFIX = 'UGT1';

const signer = new Ed25519TokenSigner({
  prefix: TICKET_QR_PREFIX,
  privateKeyEnv: 'TICKET_QR_PRIVATE_KEY_PEM',
  keyIdEnv: 'TICKET_QR_KEY_ID',
  previousPublicKeyEnv: 'TICKET_QR_PREVIOUS_PUBLIC_KEY_PEM',
  previousKeyIdEnv: 'TICKET_QR_PREVIOUS_KEY_ID',
});

function isPayload(value: unknown): value is TicketQrPayload {
  const p = value as Partial<TicketQrPayload> | null;
  return (
    !!p &&
    p.v === 1 &&
    typeof p.kid === 'string' &&
    typeof p.tid === 'string' &&
    typeof p.occ === 'string' &&
    typeof p.qv === 'number' &&
    typeof p.exp === 'number'
  );
}

/** QR do ingresso com Ed25519 e chave própria, sem chave gerada na hora (AGENTS.md §7.7, B36). */
export class Ed25519TicketQrTokenAdapter implements TicketQrTokenPort {
  constructor(private readonly now: () => number = () => Date.now()) {}

  issue(payload: Omit<TicketQrPayload, 'kid'>): string {
    return signer.sign(payload);
  }

  verify(token: string): TicketQrPayload | null {
    const payload = signer.verify(token);
    if (!isPayload(payload)) return null;
    return payload.exp * 1000 >= this.now() ? payload : null;
  }

  publicKeys(): Array<{ kid: string; publicKeyJwk: JsonWebKey }> {
    return signer.publicKeys();
  }
}

/** Só testes: esquece as chaves lidas para trocar as variáveis de ambiente. */
export function resetTicketQrKeysForTests(): void {
  signer.reset();
}
