import crypto from 'crypto';
import { afterEach, describe, expect, it } from 'vitest';
import {
  Ed25519TicketQrTokenAdapter,
  resetTicketQrKeysForTests,
} from './ed25519TicketQrTokenAdapter';

const PAYLOAD = { v: 1 as const, tid: 'tkt_1', occ: 'occ_1', qv: 1, exp: 1_900_000_000 };

function useKey(kid: string) {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519');
  process.env.TICKET_QR_PRIVATE_KEY_PEM = privateKey
    .export({ type: 'pkcs8', format: 'pem' })
    .toString();
  process.env.TICKET_QR_KEY_ID = kid;
  resetTicketQrKeysForTests();
  return publicKey.export({ type: 'spki', format: 'pem' }).toString();
}

describe('Ed25519TicketQrTokenAdapter (§7.7, B36)', () => {
  afterEach(() => {
    for (const name of [
      'TICKET_QR_PRIVATE_KEY_PEM',
      'TICKET_QR_KEY_ID',
      'TICKET_QR_PREVIOUS_PUBLIC_KEY_PEM',
      'TICKET_QR_PREVIOUS_KEY_ID',
    ]) {
      delete process.env[name];
    }
    resetTicketQrKeysForTests();
  });

  it('sem chave configurada falha, em vez de gerar chave na hora', () => {
    expect(() => new Ed25519TicketQrTokenAdapter().issue(PAYLOAD)).toThrow(
      /TICKET_QR_PRIVATE_KEY_PEM/
    );
  });

  it('recusa QR alterado, vencido ou de outro prefixo', () => {
    useKey('k1');
    const adapter = new Ed25519TicketQrTokenAdapter(() => 1_800_000_000_000);
    const token = adapter.issue(PAYLOAD);
    expect(adapter.verify(token)).toEqual({ ...PAYLOAD, kid: 'k1' });
    const [, body, signature] = token.split('.');
    const forged = Buffer.from(JSON.stringify({ ...PAYLOAD, kid: 'k1', qv: 2 })).toString(
      'base64url'
    );
    expect(adapter.verify(`UGT1.${forged}.${signature}`)).toBeNull();
    expect(adapter.verify(`UGE1.${body}.${signature}`)).toBeNull();
    expect(new Ed25519TicketQrTokenAdapter(() => 2_000_000_000_000).verify(token)).toBeNull();
  });

  it('na rotação, o QR da chave anterior continua valendo', () => {
    const oldPublic = useKey('k1');
    const oldToken = new Ed25519TicketQrTokenAdapter().issue(PAYLOAD);
    useKey('k2');
    process.env.TICKET_QR_PREVIOUS_PUBLIC_KEY_PEM = oldPublic;
    process.env.TICKET_QR_PREVIOUS_KEY_ID = 'k1';
    resetTicketQrKeysForTests();
    const adapter = new Ed25519TicketQrTokenAdapter(() => 1_800_000_000_000);
    expect(adapter.verify(oldToken)?.kid).toBe('k1');
    expect(adapter.publicKeys().map((key) => key.kid)).toEqual(['k2', 'k1']);
  });
});
