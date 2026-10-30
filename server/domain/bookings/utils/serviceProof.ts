import { type Booking, type BookableOfferKind, CHECK_IN_CODE_KINDS } from '../types/bookingTypes';

/** Tipos cujo repasse espera a prova do serviço (D20); a entrada de atração usa o QR (21.4). */
export function requiresServiceProof(kind: BookableOfferKind): boolean {
  return CHECK_IN_CODE_KINDS.includes(kind);
}

/**
 * Prova de que o serviço aconteceu (D20): check-in com o código ou o QR, ou "sim" do comprador na
 * pergunta "O serviço aconteceu?". O "Cliente sem código" sozinho não prova nada.
 */
export function hasServiceProof(
  booking: Pick<Booking, 'checkIn' | 'serviceConfirmation'>
): boolean {
  return (
    (booking.checkIn !== undefined && booking.checkIn.method !== 'no_code') ||
    booking.serviceConfirmation?.resolution === 'confirmed'
  );
}
