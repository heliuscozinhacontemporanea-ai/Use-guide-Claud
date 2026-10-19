import { randomBytes } from 'crypto';
import { describe, expect, it, vi } from 'vitest';
import { CryptoUnavailableError } from '../../shared/kernel/fieldEncryption';
import { HmacBlindIndexAdapter } from './hmacBlindIndexAdapter';
import { LocalFieldEncryptionAdapter } from './localFieldEncryptionAdapter';

const kms = vi.hoisted(() => {
  const wrap = (bytes: Uint8Array) => Buffer.from(bytes).reverse();
  return {
    encrypt: vi.fn(
      async (req: { plaintext: Uint8Array; additionalAuthenticatedData?: Uint8Array }) => [
        { name: 'keys/k/cryptoKeyVersions/3', ciphertext: wrap(req.plaintext) },
      ]
    ),
    decrypt: vi.fn(async (req: { ciphertext: Uint8Array }) => [
      { plaintext: Buffer.from(req.ciphertext).reverse() },
    ]),
  };
});
vi.mock('@google-cloud/kms', () => ({
  KeyManagementServiceClient: class {
    encrypt = kms.encrypt;
    decrypt = kms.decrypt;
  },
}));

import { KmsFieldEncryptionAdapter } from './kmsFieldEncryptionAdapter';

const DEV_ENV = {
  NODE_ENV: 'development',
  FIELD_ENCRYPTION_DEV_KEY: randomBytes(32).toString('base64'),
} as NodeJS.ProcessEnv;
const CONTEXT = { documentId: 'item-1', field: 'document' };

describe('criptografia de campo (AGENTS.md §7.7)', () => {
  it('cifra e decifra; o texto cifrado não contém o valor', async () => {
    const adapter = new LocalFieldEncryptionAdapter(DEV_ENV);
    const encrypted = await adapter.encrypt('12345678000195', CONTEXT);
    expect(JSON.stringify(encrypted)).not.toContain('12345678000195');
    expect(encrypted.v).toBe(1);
    expect(await adapter.decrypt(encrypted, CONTEXT)).toBe('12345678000195');
  });

  it('usa IV novo a cada operação', async () => {
    const adapter = new LocalFieldEncryptionAdapter(DEV_ENV);
    const a = await adapter.encrypt('valor', CONTEXT);
    const b = await adapter.encrypt('valor', CONTEXT);
    expect(a.iv).not.toBe(b.iv);
    expect(a.ct).not.toBe(b.ct);
  });

  it('recusa valor copiado para outro documento (associated data)', async () => {
    const adapter = new LocalFieldEncryptionAdapter(DEV_ENV);
    const encrypted = await adapter.encrypt('valor', CONTEXT);
    await expect(
      adapter.decrypt(encrypted, { documentId: 'item-2', field: 'document' })
    ).rejects.toThrow();
  });

  it('a chave de teste se recusa a rodar em produção', async () => {
    const adapter = new LocalFieldEncryptionAdapter({ ...DEV_ENV, NODE_ENV: 'production' });
    await expect(adapter.encrypt('valor', CONTEXT)).rejects.toThrow(/produção/);
  });

  it('sem chave de teste: CryptoUnavailableError', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const adapter = new LocalFieldEncryptionAdapter({
      NODE_ENV: 'development',
    } as NodeJS.ProcessEnv);
    await expect(adapter.encrypt('valor', CONTEXT)).rejects.toBeInstanceOf(CryptoUnavailableError);
  });

  it('KMS: a chave de dados sai cifrada e o kid guarda a versão da chave mestra', async () => {
    const adapter = new KmsFieldEncryptionAdapter('keys/k');
    const encrypted = await adapter.encrypt('12345678000195', CONTEXT);
    expect(encrypted.kid).toBe('keys/k/cryptoKeyVersions/3');
    expect(encrypted.dek).toBeTruthy();
    expect(await adapter.decrypt(encrypted, CONTEXT)).toBe('12345678000195');
    const aad = Buffer.from(kms.encrypt.mock.calls[0]?.[0].additionalAuthenticatedData as Buffer);
    expect(aad.toString()).toBe('item-1|document');
  });
});

describe('índice cego (blind index)', () => {
  const env = { PII_BLIND_INDEX_KEY: 'k'.repeat(32) } as NodeJS.ProcessEnv;

  it('é estável, separa por finalidade e não revela o valor', () => {
    const index = new HmacBlindIndexAdapter(env);
    const a = index.indexFor('cnpj', '12345678000195');
    expect(a).toBe(index.indexFor('cnpj', '12345678000195'));
    expect(a).not.toBe(index.indexFor('cpf', '12345678000195'));
    expect(a).not.toContain('12345678');
  });

  it('sem chave: CryptoUnavailableError', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => new HmacBlindIndexAdapter({} as NodeJS.ProcessEnv).indexFor('cnpj', '1')).toThrow(
      CryptoUnavailableError
    );
  });
});
