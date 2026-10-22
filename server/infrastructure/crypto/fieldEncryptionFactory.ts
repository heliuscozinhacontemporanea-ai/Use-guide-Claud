import type {
  BlindIndexPort,
  EncryptedField,
  FieldEncryptionContext,
  FieldEncryptionPort,
} from '../../shared/kernel/fieldEncryption';
import { CryptoUnavailableError } from '../../shared/kernel/fieldEncryption';
import { HmacBlindIndexAdapter } from './hmacBlindIndexAdapter';
import { KmsFieldEncryptionAdapter } from './kmsFieldEncryptionAdapter';
import { LocalFieldEncryptionAdapter } from './localFieldEncryptionAdapter';

/** Escolhe o adapter na primeira chamada: Cloud KMS quando configurado; chave de teste só fora de produção. */
class LazyFieldEncryption implements FieldEncryptionPort {
  private resolved: FieldEncryptionPort | null = null;

  private target(): FieldEncryptionPort {
    if (this.resolved) return this.resolved;
    const kmsKey = process.env.FIELD_ENCRYPTION_KMS_KEY?.trim();
    if (kmsKey) {
      this.resolved = new KmsFieldEncryptionAdapter(kmsKey);
    } else if (process.env.NODE_ENV !== 'production') {
      this.resolved = new LocalFieldEncryptionAdapter();
    } else {
      console.error('[crypto] FIELD_ENCRYPTION_KMS_KEY ausente em produção.');
      throw new CryptoUnavailableError();
    }
    return this.resolved;
  }

  encrypt(plain: string, context: FieldEncryptionContext): Promise<EncryptedField> {
    return this.target().encrypt(plain, context);
  }

  decrypt(field: EncryptedField, context: FieldEncryptionContext): Promise<string> {
    return this.target().decrypt(field, context);
  }
}

export const fieldEncryption: FieldEncryptionPort = new LazyFieldEncryption();
export const blindIndex: BlindIndexPort = new HmacBlindIndexAdapter();
