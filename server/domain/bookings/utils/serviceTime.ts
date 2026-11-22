import type { Booking } from '../types/bookingTypes';

const MINUTE_MS = 60_000;

/** Fim do serviço: início mais a duração da oferta (sem duração, o fim é o próprio início). */
export function serviceEndsAtMs(startsAt: string, durationMinutes?: number): number {
  return new Date(startsAt).getTime() + (durationMinutes ?? 0) * MINUTE_MS;
}

/** Fim do serviço da reserva em ISO, usado no repasse, na reclamação e na conclusão. */
export function bookingServiceEndsAt(booking: Pick<Booking, 'offerSnapshot'>): string {
  const { startsAt, durationMinutes } = booking.offerSnapshot;
  return new Date(serviceEndsAtMs(startsAt, durationMinutes)).toISOString();
}

/**
 * Duração do horário: o fim gravado no horário (aluguel por horas, F3b, e remarcações), senão a da
 * oferta.
 */
export function slotDurationMinutes(
  slot: { startsAt: string; endsAt?: string },
  offerDurationMinutes?: number
): number | undefined {
  if (!slot.endsAt) return offerDurationMinutes;
  return Math.round((Date.parse(slot.endsAt) - Date.parse(slot.startsAt)) / MINUTE_MS);
}
