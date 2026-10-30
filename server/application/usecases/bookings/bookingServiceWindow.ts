import type { Booking } from '../../../domain/bookings';

/** Início e fim do serviço da reserva, para abrir a reclamação no domínio de pagamento. */
export function bookingServiceWindow(booking: Booking): {
  serviceStartsAt: string;
  serviceEndsAt: string;
} {
  const { startsAt, durationMinutes } = booking.offerSnapshot;
  return {
    serviceStartsAt: startsAt,
    serviceEndsAt: new Date(
      new Date(startsAt).getTime() + (durationMinutes ?? 0) * 60_000
    ).toISOString(),
  };
}
