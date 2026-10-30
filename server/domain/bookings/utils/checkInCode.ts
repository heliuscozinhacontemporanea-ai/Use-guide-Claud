import crypto from 'crypto';

/** Sem 0/O e 1/I/L, que se confundem ditos em voz alta ou digitados (D20). */
export const CHECK_IN_CODE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
export const CHECK_IN_CODE_LENGTH = 6;

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

function derive(secret: string, bookingId: string): string {
  let code = '';
  for (let counter = 0; code.length < CHECK_IN_CODE_LENGTH; counter += 1) {
    const digest = crypto.createHmac('sha256', secret).update(`${bookingId}:${counter}`).digest();
    for (const byte of digest) {
      if (byte >= UNBIASED_BYTE_LIMIT) continue;
      code += CHECK_IN_CODE_ALPHABET[byte % CHECK_IN_CODE_ALPHABET.length];
      if (code.length === CHECK_IN_CODE_LENGTH) break;
    }
  }
  return code;
}

/**
 * Código da reserva, derivado do ID com o segredo do Secret Manager e nunca gravado (exceção do
 * AGENTS.md §7.7, D20): quem lê o banco não descobre códigos.
 */
export function deriveCheckInCode(bookingId: string): string {
  return derive(currentSecret(), bookingId);
}

/** Códigos aceitos no check-in: o do segredo atual e, durante a rotação, o do anterior (§7.8). */
export function listAcceptedCheckInCodes(bookingId: string): string[] {
  const codes = [deriveCheckInCode(bookingId)];
  const previous = readSecret('BOOKING_CHECKIN_CODE_SECRET_PREVIOUS', MIN_PREVIOUS_SECRET_LENGTH);
  if (previous) codes.push(derive(previous, bookingId));
  return codes;
}

const CODE_PATTERN = new RegExp(`^[${CHECK_IN_CODE_ALPHABET}]{${CHECK_IN_CODE_LENGTH}}$`);

/** Aceita minúsculas, espaços e hífen (o app mostra `K7M-4QX`); devolve null se não for um código. */
export function normalizeCheckInCode(input: string): string | null {
  const normalized = input.toUpperCase().replace(/[\s-]/g, '');
  return CODE_PATTERN.test(normalized) ? normalized : null;
}

export function checkInCodesMatch(expected: string, received: string): boolean {
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
