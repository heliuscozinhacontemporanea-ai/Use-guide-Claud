import { randomBytes } from 'crypto';
import { KeyManagementServiceClient } from '@google-cloud/kms';
import type {
  EncryptedField,
  FieldEncryptionContext,
  FieldEncryptionPort,
} from '../../shared/kernel/fieldEncryption';
import { aesGcmDecrypt, aesGcmEncrypt, encryptionAad } from './aesGcm';

/**
 * Envelope encryption (AGENTS.md §7.7): uma chave de dados (DEK) por valor, cifrada pela chave mestra do
 * Cloud KMS, que nunca sai do KMS. O `kid` guarda a versão da chave mestra usada.
 */
export class KmsFieldEncryptionAdapter implements FieldEncryptionPort {
  private client: KeyManagementServiceClient | null = null;

  constructor(private readonly keyName: string) {}

  private kms(): KeyManagementServiceClient {
    this.client ??= new KeyManagementServiceClient();
    return this.client;
  }

  async encrypt(plain: string, context: FieldEncryptionContext): Promise<EncryptedField> {
    const aad = encryptionAad(context.documentId, context.field);
    const dataKey = randomBytes(32);
    try {
      const [wrapped] = await this.kms().encrypt({
        name: this.keyName,
        plaintext: dataKey,
        additionalAuthenticatedData: Buffer.from(aad, 'utf8'),
      });
      if (!wrapped.ciphertext || !wrapped.name) {
        throw new Error('Cloud KMS não devolveu a chave de dados cifrada.');
      }
      const payload = aesGcmEncrypt(dataKey, plain, aad);
      return {
        v: 1,
        kid: wrapped.name,
        dek: Buffer.from(wrapped.ciphertext as Uint8Array).toString('base64url'),
        ...payload,
      };
    } finally {
      dataKey.fill(0);
    }
  }

  async decrypt(field: EncryptedField, context: FieldEncryptionContext): Promise<string> {
    if (!field.dek) {
      throw new Error('Valor cifrado sem chave de dados.');
    }
    const aad = encryptionAad(context.documentId, context.field);
    const [unwrapped] = await this.kms().decrypt({
      name: this.keyName,
      ciphertext: Buffer.from(field.dek, 'base64url'),
      additionalAuthenticatedData: Buffer.from(aad, 'utf8'),
    });
    if (!unwrapped.plaintext) {
      throw new Error('Cloud KMS não devolveu a chave de dados.');
    }
    const dataKey = Buffer.from(unwrapped.plaintext as Uint8Array);
    try {
      return aesGcmDecrypt(dataKey, field, aad);
    } finally {
      dataKey.fill(0);
    }
  }
}
