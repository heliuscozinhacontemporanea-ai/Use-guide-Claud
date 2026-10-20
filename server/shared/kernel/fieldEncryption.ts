/** Valor cifrado em nível de campo (AGENTS.md §7.7): `kid` permite rotação; `dek` é a chave de dados cifrada pelo KMS. */
export interface EncryptedField {
  v: 1;
  kid: string;
  iv: string;
  tag: string;
  ct: string;
  dek?: string;
}

/** Entra como associated data: impede copiar o valor cifrado para outro documento ou campo. */
export interface FieldEncryptionContext {
  documentId: string;
  field: string;
}

export interface FieldEncryptionPort {
  encrypt(plain: string, context: FieldEncryptionContext): Promise<EncryptedField>;
  decrypt(field: EncryptedField, context: FieldEncryptionContext): Promise<string>;
}

/** HMAC estável para busca e unicidade sem gravar o valor (blind index). */
export interface BlindIndexPort {
  indexFor(purpose: string, normalizedValue: string): string;
}

/** Chave de criptografia ou de índice ausente: a rota responde 503, o processo continua de pé. */
export class CryptoUnavailableError extends Error {
  readonly code = 'CRYPTO_UNAVAILABLE';

  constructor() {
    super('Proteção de dados indisponível no momento.');
    this.name = 'CryptoUnavailableError';
  }
}
