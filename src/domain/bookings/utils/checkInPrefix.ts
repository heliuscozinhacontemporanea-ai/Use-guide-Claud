import type { OfferKind } from '../types/bookings';

export { CHECK_IN_ALPHABET } from '../../../shared/constants/checkInCode';
export const CHECK_IN_CODE_LENGTH = 6;
export const ENTRY_CODE_LENGTH = 8;

// Iguais nos três idiomas, como um código de voo (D20); não são traduzidos nem enviados ao servidor.
const PREFIX: Record<OfferKind, string> = {
  tour: 'PASS',
  private_entry: 'ENTR',
  rental: 'ALUG',
  transfer: 'TRAN',
};

export function checkInPrefix(kind: OfferKind): string {
  return PREFIX[kind];
}

export function codeLengthFor(kind: OfferKind): number {
  return kind === 'private_entry' ? ENTRY_CODE_LENGTH : CHECK_IN_CODE_LENGTH;
}

/** Tipos com check-in por código de 6 caracteres; a entrada usa QR e código de 8. */
export function usesCheckInCode(kind: OfferKind): boolean {
  return kind !== 'private_entry';
}
