import type { Booking } from '../../../domain/bookings';

/** O que o admin vê para decidir a reclamação de uma reserva (D20); só por allowlist (§7.9). */
export interface BookingServiceEvidence {
  startsAt: string;
  pickupAddress: string | null;
  checkIn: {
    at: string;
    method: 'code' | 'no_code';
    participantsPresent: number;
    participantsCount: number;
    noCodeReason: string | null;
  } | null;
  arrival: { at: string; location: { lat: number; lng: number; accuracyM?: number } | null } | null;
  providerAbsence: {
    reportedAt: string;
    answer: string | null;
    answeredAt: string | null;
  } | null;
  serviceConfirmation: { reason: string; answer: string | null } | null;
  noShow: boolean;
}

export function toBookingServiceEvidence(booking: Booking): BookingServiceEvidence {
  return {
    startsAt: booking.offerSnapshot.startsAt,
    pickupAddress: booking.pickupAddress ?? null,
    checkIn: booking.checkIn
      ? {
          at: booking.checkIn.at,
          method: booking.checkIn.method,
          participantsPresent: booking.checkIn.participantsPresent,
          participantsCount: booking.participantsCount,
          noCodeReason: booking.checkIn.noCodeReason ?? null,
        }
      : null,
    arrival: booking.arrival
      ? { at: booking.arrival.at, location: booking.arrival.location ?? null }
      : null,
    providerAbsence: booking.providerAbsence
      ? {
          reportedAt: booking.providerAbsence.reportedAt,
          answer: booking.providerAbsence.answer ?? null,
          answeredAt: booking.providerAbsence.answeredAt ?? null,
        }
      : null,
    serviceConfirmation: booking.serviceConfirmation
      ? {
          reason: booking.serviceConfirmation.reason,
          answer: booking.serviceConfirmation.answer ?? null,
        }
      : null,
    noShow: booking.status === 'no_show',
  };
}
