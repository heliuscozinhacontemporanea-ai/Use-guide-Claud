import type { Booking } from '../../../domain/bookings';

/** O que o admin vê para decidir a reclamação de uma reserva (D20); só por allowlist (§7.9). */
export interface BookingServiceEvidence {
  startsAt: string;
  pickupAddress: string | null;
  /** Unidades usadas (pessoas ou grupos) de quantas foram compradas, e como. */
  checkIn: {
    at: string;
    method: 'code' | 'qr' | 'no_code';
    used: number;
    total: number;
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
  const checkIns = [...(booking.checkIns ?? [])].sort((a, b) => a.at.localeCompare(b.at));
  const first = checkIns[0];
  return {
    startsAt: booking.offerSnapshot.startsAt,
    pickupAddress: booking.pickupAddress ?? null,
    checkIn: first
      ? {
          at: first.at,
          method: first.method,
          used: checkIns.length,
          total: booking.participantsCount,
          noCodeReason: first.noCodeReason ?? null,
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
