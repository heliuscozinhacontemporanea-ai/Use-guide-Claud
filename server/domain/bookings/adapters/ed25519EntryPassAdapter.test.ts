import crypto from 'crypto';
import { afterEach, describe, expect, it } from 'vitest';
import { Ed25519EntryPassAdapter, resetEntryPassKeysForTests } from './ed25519EntryPassAdapter';

function pem(): { privatePem: string; publicPem: string } {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519');
  return {
    privatePem: privateKey.export({ type: 'pkcs8', format: 'pem' }).toString(),
    publicPem: publicKey.export({ type: 'spki', format: 'pem' }).toString(),
  };
}

const PAYLOAD = {
  v: 1 as const,
  bid: 'bk_1',
  sid: 'slot-1',
  oid: 'offer-1',
  u: 1,
  nm: 'Ana Souza',
  exp: 1_800_000_000,
};

function useKey(privatePem: string, kid: string) {
  process.env.BOOKING_ENTRY_QR_PRIVATE_KEY_PEM = privatePem;
  process.env.BOOKING_ENTRY_QR_KEY_ID = kid;
  resetEntryPassKeysForTests();
}

describe('Ed25519EntryPassAdapter (§7.7)', () => {
  afterEach(() => {
    for (const name of [
      'BOOKING_ENTRY_QR_PRIVATE_KEY_PEM',
      'BOOKING_ENTRY_QR_KEY_ID',
      'BOOKING_ENTRY_QR_PREVIOUS_PUBLIC_KEY_PEM',
      'BOOKING_ENTRY_QR_PREVIOUS_KEY_ID',
    ]) {
      delete process.env[name];
    }
    resetEntryPassKeysForTests();
  });

  it('assina, confere e recusa QR alterado', () => {
    useKey(pem().privatePem, 'k1');
    const adapter = new Ed25519EntryPassAdapter();
    const token = adapter.sign(PAYLOAD);
    expect(token.startsWith('UGE1.')).toBe(true);
    // Ed25519 é determinística: o mesmo QR pode ser mostrado de novo sem gravar nada.
    expect(adapter.sign(PAYLOAD)).toBe(token);
    expect(adapter.verify(token)).toEqual({ ...PAYLOAD, kid: 'k1' });
    const [prefix, body, signature] = token.split('.');
    const forged = Buffer.from(JSON.stringify({ ...PAYLOAD, kid: 'k1', u: 0 }), 'utf8').toString(
      'base64url'
    );
    expect(adapter.verify(`${prefix}.${forged}.${signature}`)).toBeNull();
    expect(adapter.verify(`XXXX.${body}.${signature}`)).toBeNull();
    expect(adapter.verify('lixo')).toBeNull();
  });

  it('sem chave configurada falha, em vez de gerar chave na hora', () => {
    const adapter = new Ed25519EntryPassAdapter();
    expect(() => adapter.sign(PAYLOAD)).toThrow(/BOOKING_ENTRY_QR_PRIVATE_KEY_PEM/);
  });

  it('recusa chave que não é Ed25519', () => {
    const { privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
    useKey(privateKey.export({ type: 'pkcs8', format: 'pem' }).toString(), 'k1');
    expect(() => new Ed25519EntryPassAdapter().sign(PAYLOAD)).toThrow(/Ed25519/);
  });

  it('na rotação, o QR assinado com a chave anterior continua valendo', () => {
    const old = pem();
    useKey(old.privatePem, 'k1');
    const oldToken = new Ed25519EntryPassAdapter().sign(PAYLOAD);
    useKey(pem().privatePem, 'k2');
    process.env.BOOKING_ENTRY_QR_PREVIOUS_PUBLIC_KEY_PEM = old.publicPem;
    process.env.BOOKING_ENTRY_QR_PREVIOUS_KEY_ID = 'k1';
    resetEntryPassKeysForTests();
    const adapter = new Ed25519EntryPassAdapter();
    expect(adapter.verify(oldToken)?.kid).toBe('k1');
    expect(adapter.publicKeys().map((key) => key.kid)).toEqual(['k2', 'k1']);
  });
});
