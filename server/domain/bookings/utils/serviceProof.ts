import {
  type BookableOfferKind,
  type Booking,
  type BookingCheckIn,
  CHECK_IN_CODE_KINDS,
} from '../types/bookingTypes';

/** Tipos cujo repasse espera a prova do serviço (D20); a entrada de atração usa o QR. */
export function requiresServiceProof(kind: BookableOfferKind): boolean {
  return CHECK_IN_CODE_KINDS.includes(kind);
}

export function checkInsOf(booking: Pick<Booking, 'checkIns'>): BookingCheckIn[] {
  return booking.checkIns ?? [];
}

export function hasAnyCheckIn(booking: Pick<Booking, 'checkIns'>): boolean {
  return checkInsOf(booking).length > 0;
}

/**
 * Prova de que o serviço aconteceu (D20): check-in de alguma unidade com o código ou o QR, ou "sim"
 * do cliente na pergunta "O serviço aconteceu?". O "Cliente sem código" sozinho não prova nada.
 */
export function hasServiceProof(
  booking: Pick<Booking, 'checkIns' | 'serviceConfirmation'>
): boolean {
  return (
    checkInsOf(booking).some((checkIn) => checkIn.method !== 'no_code') ||
    booking.serviceConfirmation?.resolution === 'confirmed'
  );
}

/** Check-ins de unidades que ainda não têm check-in (repetir a mesma unidade não conta de novo). */
export function newCheckIns(
  booking: Pick<Booking, 'checkIns' | 'participantsCount'>,
  candidates: BookingCheckIn[]
): BookingCheckIn[] {
  const used = new Set(checkInsOf(booking).map((checkIn) => checkIn.unit));
  return candidates.filter((candidate) => {
    if (used.has(candidate.unit) || candidate.unit >= booking.participantsCount) return false;
    used.add(candidate.unit);
    return true;
  });
}
