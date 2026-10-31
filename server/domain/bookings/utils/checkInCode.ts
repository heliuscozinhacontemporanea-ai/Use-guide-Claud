import {
  SHORT_CODE_ALPHABET,
  ShortCodeDeriver,
  normalizeShortCode,
  shortCodesMatch,
} from '../../../infrastructure/crypto/shortCode';

export const CHECK_IN_CODE_ALPHABET = SHORT_CODE_ALPHABET;
export const CHECK_IN_CODE_LENGTH = 6;
/** Entrada de atração privada: código junto do QR, com 8 caracteres (D20). */
export const ENTRY_CODE_LENGTH = 8;

const codes = new ShortCodeDeriver('BOOKING_CHECKIN_CODE_SECRET');

/**
 * Um código por unidade da reserva (D20). `entry:` separa o código da entrada do de 6 caracteres,
 * mesmo com o mesmo segredo.
 */
function label(bookingId: string, length: number, unit: number): string {
  return `${length === ENTRY_CODE_LENGTH ? 'entry:' : ''}${bookingId}#${unit}`;
}

/**
 * Código da reserva, derivado do ID com o segredo do Secret Manager e nunca gravado (exceção do
 * AGENTS.md §7.7, D20): quem lê o banco não descobre códigos.
 */
export function deriveCheckInCode(
  bookingId: string,
  length = CHECK_IN_CODE_LENGTH,
  unit = 0
): string {
  return codes.current(label(bookingId, length, unit), length);
}

/** Códigos aceitos no check-in: o do segredo atual e, durante a rotação, o do anterior (§7.8). */
export function listAcceptedCheckInCodes(
  bookingId: string,
  length = CHECK_IN_CODE_LENGTH,
  unit = 0
): string[] {
  return codes.accepted(label(bookingId, length, unit), length);
}

/** Unidade da reserva cujo código bate com o digitado, ou null. */
export function matchCheckInCodeUnit(
  bookingId: string,
  units: number,
  code: string,
  length = CHECK_IN_CODE_LENGTH
): number | null {
  for (let unit = 0; unit < units; unit += 1) {
    if (codes.matches(label(bookingId, length, unit), length, code)) return unit;
  }
  return null;
}

export function normalizeCheckInCode(input: string, length = CHECK_IN_CODE_LENGTH): string | null {
  return normalizeShortCode(input, length);
}

export const checkInCodesMatch = shortCodesMatch;
