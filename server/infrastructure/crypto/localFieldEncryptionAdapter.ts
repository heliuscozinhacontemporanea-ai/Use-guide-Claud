import type {
  EncryptedField,
  FieldEncryptionContext,
  FieldEncryptionPort,
} from '../../shared/kernel/fieldEncryption';
import { CryptoUnavailableError } from '../../shared/kernel/fieldEncryption';
import { aesGcmDecrypt, aesGcmEncrypt, encryptionAad } from './aesGcm';

const DEV_KID = 'dev-1';

/** Chave de teste do painel Secrets do AI Studio; recusa produção (AGENTS.md §7.7 item 7). */
export class LocalFieldEncryptionAdapter implements FieldEncryptionPort {
  constructor(private readonly env: NodeJS.ProcessEnv = process.env) {}

  private key(): Buffer {
    if (this.env.NODE_ENV === 'production') {
      throw new Error('LocalFieldEncryptionAdapter não pode ser usado em produção.');
    }
    const raw = this.env.FIELD_ENCRYPTION_DEV_KEY?.trim();
    const key = raw ? Buffer.from(raw, 'base64') : null;
    if (key?.length !== 32) {
      console.error('[crypto] FIELD_ENCRYPTION_DEV_KEY ausente ou sem 32 bytes em base64.');
      throw new CryptoUnavailableError();
    }
    return key;
  }

  async encrypt(plain: string, context: FieldEncryptionContext): Promise<EncryptedField> {
    const payload = aesGcmEncrypt(
      this.key(),
      plain,
      encryptionAad(context.documentId, context.field)
    );
    return { v: 1, kid: DEV_KID, ...payload };
  }

  async decrypt(field: EncryptedField, context: FieldEncryptionContext): Promise<string> {
    return aesGcmDecrypt(this.key(), field, encryptionAad(context.documentId, context.field));
  }
}
