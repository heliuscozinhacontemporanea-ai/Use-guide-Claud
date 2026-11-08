import type { BookingSummary } from '../types/bookings';
import { usesCheckInCode } from './checkInPrefix';

const MINUTE_MS = 60_000;
// Mesmos prazos do backend (D20); a UI só decide o que mostrar, quem confere é o servidor.
const PROVIDER_ABSENT_AFTER_MS = 30 * MINUTE_MS;
const NO_SHOW_WAIT_MS = 30 * MINUTE_MS;
const CHECK_IN_CLOSES_AFTER_MS = 12 * 60 * MINUTE_MS;

export function serviceEndMs(booking: BookingSummary): number {
  return (
    new Date(booking.offer.startsAt).getTime() + (booking.offer.durationMinutes ?? 0) * MINUTE_MS
  );
}

/** "O prestador não veio": 30 min depois do horário, sem check-in nem relato. */
export function canReportProviderAbsent(booking: BookingSummary, now: Date): boolean {
  const nowMs = now.getTime();
  return (
    usesCheckInCode(booking.kind) &&
    booking.status === 'confirmed' &&
    booking.checkIns.length === 0 &&
    !booking.providerAbsence &&
    nowMs >= new Date(booking.offer.startsAt).getTime() + PROVIDER_ABSENT_AFTER_MS &&
    nowMs <= serviceEndMs(booking) + CHECK_IN_CLOSES_AFTER_MS
  );
}

/** Pergunta "O serviço aconteceu?" ainda aberta. */
export function isConfirmationPending(booking: BookingSummary, now: Date): boolean {
  const confirmation = booking.serviceConfirmation;
  return (
    !!confirmation &&
    !confirmation.answer &&
    !confirmation.resolution &&
    now.getTime() <= new Date(confirmation.answerBy).getTime()
  );
}

/** Hora a partir da qual o prestador pode marcar a ausência; null sem "Cheguei". */
export function noShowAvailableAt(booking: BookingSummary): Date | null {
  return booking.arrivedAt
    ? new Date(new Date(booking.arrivedAt).getTime() + NO_SHOW_WAIT_MS)
    : null;
}
