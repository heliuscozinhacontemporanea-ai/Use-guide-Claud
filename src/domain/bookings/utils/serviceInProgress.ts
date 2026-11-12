import type { BookingSummary } from '../types/bookings';

/** O prestador já iniciou o serviço (C4) e ele ainda não acabou: "Em andamento" para o comprador. */
export function serviceInProgress(
  booking: Pick<BookingSummary, 'status' | 'serviceStartedAt' | 'offer'>,
  nowMs: number
): boolean {
  if (booking.status !== 'confirmed' || !booking.serviceStartedAt) return false;
  const endMs =
    new Date(booking.offer.startsAt).getTime() + (booking.offer.durationMinutes ?? 0) * 60_000;
  return nowMs < endMs;
}
