import crypto from 'crypto';

/** Sem 0/O e 1/I/L, que se confundem ditos em voz alta ou digitados (D20). */
export const CHECK_IN_CODE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
export const CHECK_IN_CODE_LENGTH = 6;
/** Entrada de atração privada: código junto do QR, com 8 caracteres (D20). */
export const ENTRY_CODE_LENGTH = 8;

const MIN_CURRENT_SECRET_LENGTH = 32;
const MIN_PREVIOUS_SECRET_LENGTH = 16;
// Maior múltiplo de 31 que cabe num byte: bytes acima são descartados para não favorecer letras.
const UNBIASED_BYTE_LIMIT = 248;

function readSecret(name: string, minLength: number): string | null {
  const value = process.env[name]?.trim();
  return value && value.length >= minLength ? value : null;
}

function currentSecret(): string {
  const secret = readSecret('BOOKING_CHECKIN_CODE_SECRET', MIN_CURRENT_SECRET_LENGTH);
  if (!secret) {
    throw new Error(
      `BOOKING_CHECKIN_CODE_SECRET ausente ou com menos de ${MIN_CURRENT_SECRET_LENGTH} caracteres.`
    );
  }
  return secret;
}

/** `entry:` separa o código da entrada do código de 6 caracteres, mesmo com o mesmo segredo. */
function derive(secret: string, bookingId: string, length: number): string {
  const label = length === ENTRY_CODE_LENGTH ? `entry:${bookingId}` : bookingId;
  let code = '';
  for (let counter = 0; code.length < length; counter += 1) {
    const digest = crypto.createHmac('sha256', secret).update(`${label}:${counter}`).digest();
    for (const byte of digest) {
      if (byte >= UNBIASED_BYTE_LIMIT) continue;
      code += CHECK_IN_CODE_ALPHABET[byte % CHECK_IN_CODE_ALPHABET.length];
      if (code.length === length) break;
    }
  }
  return code;
}

/**
 * Código da reserva, derivado do ID com o segredo do Secret Manager e nunca gravado (exceção do
 * AGENTS.md §7.7, D20): quem lê o banco não descobre códigos.
 */
export function deriveCheckInCode(bookingId: string, length = CHECK_IN_CODE_LENGTH): string {
  return derive(currentSecret(), bookingId, length);
}

/** Códigos aceitos no check-in: o do segredo atual e, durante a rotação, o do anterior (§7.8). */
export function listAcceptedCheckInCodes(
  bookingId: string,
  length = CHECK_IN_CODE_LENGTH
): string[] {
  const codes = [deriveCheckInCode(bookingId, length)];
  const previous = readSecret('BOOKING_CHECKIN_CODE_SECRET_PREVIOUS', MIN_PREVIOUS_SECRET_LENGTH);
  if (previous) codes.push(derive(previous, bookingId, length));
  return codes;
}

/**
 * Aceita minúsculas, espaços, hífen e o prefixo da tela (`PASS:`, `ENTR:`), que não é gravado nem
 * conferido (D20); devolve null se não for um código do tamanho pedido.
 */
export function normalizeCheckInCode(input: string, length = CHECK_IN_CODE_LENGTH): string | null {
  const normalized = input
    .toUpperCase()
    .replace(/^[A-Z]{4}:/, '')
    .replace(/[\s-]/g, '');
  const pattern = new RegExp(`^[${CHECK_IN_CODE_ALPHABET}]{${length}}$`);
  return pattern.test(normalized) ? normalized : null;
}

export function checkInCodesMatch(expected: string, received: string): boolean {
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
