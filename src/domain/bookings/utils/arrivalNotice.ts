import type { BookingSummary } from '../types/bookings';

/**
 * O aviso "chegou" (p45, D27) fica na reserva enquanto o cliente ainda é esperado: depois do
 * "Cheguei", sem código usado, sem "Não vou mais", sem ausência relatada e até o fim do serviço.
 */
export function showsArrivalNotice(booking: BookingSummary, now: Date): boolean {
  if (booking.status !== 'confirmed' || !booking.arrivedAt) return false;
  if (booking.checkIns.length > 0 || booking.providerAbsence) return false;
  if (booking.arrivalResponse?.response === 'not_going') return false;
  const end =
    new Date(booking.offer.startsAt).getTime() + (booking.offer.durationMinutes ?? 0) * 60_000;
  return now.getTime() <= end;
}
