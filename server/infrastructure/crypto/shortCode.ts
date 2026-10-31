import crypto from 'crypto';

/** Sem 0/O e 1/I/L, que se confundem ditos em voz alta ou digitados (D20). */
export const SHORT_CODE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

const MIN_CURRENT_SECRET_LENGTH = 32;
const MIN_PREVIOUS_SECRET_LENGTH = 16;
// Maior múltiplo de 31 que cabe num byte: bytes acima são descartados para não favorecer letras.
const UNBIASED_BYTE_LIMIT = 248;

/** Código curto derivado por HMAC-SHA-256 de um rótulo (ID, unidade, versão); nunca gravado. */
export function deriveShortCode(secret: string, label: string, length: number): string {
  let code = '';
  for (let counter = 0; code.length < length; counter += 1) {
    const digest = crypto.createHmac('sha256', secret).update(`${label}:${counter}`).digest();
    for (const byte of digest) {
      if (byte >= UNBIASED_BYTE_LIMIT) continue;
      code += SHORT_CODE_ALPHABET[byte % SHORT_CODE_ALPHABET.length];
      if (code.length === length) break;
    }
  }
  return code;
}

/**
 * Aceita minúsculas, espaços, hífen e o prefixo da tela (`PASS:`, `INGR:`), que não é gravado nem
 * conferido (D20); devolve null se não for um código do tamanho pedido.
 */
export function normalizeShortCode(input: string, length: number): string | null {
  const normalized = input
    .toUpperCase()
    .replace(/^[A-Z]{4}:/, '')
    .replace(/[\s-]/g, '');
  const pattern = new RegExp(`^[${SHORT_CODE_ALPHABET}]{${length}}$`);
  return pattern.test(normalized) ? normalized : null;
}

export function shortCodesMatch(expected: string, received: string): boolean {
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/**
 * Códigos de um uso (reserva, ingresso) com o segredo do Secret Manager e, durante a rotação, o
 * anterior (§7.8). Sem o segredo atual, falha na primeira chamada (§2.2.4).
 */
export class ShortCodeDeriver {
  constructor(
    private readonly secretEnv: string,
    private readonly env: NodeJS.ProcessEnv = process.env
  ) {}

  current(label: string, length: number): string {
    return deriveShortCode(this.currentSecret(), label, length);
  }

  accepted(label: string, length: number): string[] {
    const codes = [this.current(label, length)];
    const previous = this.readSecret(`${this.secretEnv}_PREVIOUS`, MIN_PREVIOUS_SECRET_LENGTH);
    if (previous) codes.push(deriveShortCode(previous, label, length));
    return codes;
  }

  matches(label: string, length: number, code: string): boolean {
    return this.accepted(label, length).some((accepted) => shortCodesMatch(accepted, code));
  }

  private readSecret(name: string, minLength: number): string | null {
    const value = this.env[name]?.trim();
    return value && value.length >= minLength ? value : null;
  }

  private currentSecret(): string {
    const secret = this.readSecret(this.secretEnv, MIN_CURRENT_SECRET_LENGTH);
    if (!secret) {
      throw new Error(
        `${this.secretEnv} ausente ou com menos de ${MIN_CURRENT_SECRET_LENGTH} caracteres.`
      );
    }
    return secret;
  }
}
