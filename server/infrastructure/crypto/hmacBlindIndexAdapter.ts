import { createHmac } from 'crypto';
import type { BlindIndexPort } from '../../shared/kernel/fieldEncryption';
import { CryptoUnavailableError } from '../../shared/kernel/fieldEncryption';

const MIN_KEY_LENGTH = 32;

/** HMAC-SHA-256 com `PII_BLIND_INDEX_KEY` (Secret Manager). Trocar a chave exige recalcular os índices. */
export class HmacBlindIndexAdapter implements BlindIndexPort {
  constructor(private readonly env: NodeJS.ProcessEnv = process.env) {}

  indexFor(purpose: string, normalizedValue: string): string {
    const key = this.env.PII_BLIND_INDEX_KEY?.trim();
    if (!key || key.length < MIN_KEY_LENGTH) {
      console.error('[crypto] PII_BLIND_INDEX_KEY ausente ou com menos de 32 caracteres.');
      throw new CryptoUnavailableError();
    }
    return createHmac('sha256', key).update(`${purpose}:${normalizedValue}`).digest('base64url');
  }
}
