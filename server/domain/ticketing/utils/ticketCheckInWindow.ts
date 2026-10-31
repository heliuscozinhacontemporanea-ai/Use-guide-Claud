import { businessDayStartMs } from '../../../shared/kernel/businessDay';

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;

/** Mesma janela do QR assinado e da sessão sem internet: de 6 h antes do início a 6 h depois do fim. */
export const TICKET_CHECK_IN_OPENS_BEFORE_MS = 6 * HOUR_MS;
export const TICKET_CHECK_IN_CLOSES_AFTER_MS = 6 * HOUR_MS;
/** Código errado: no máximo 5 por pessoa da equipe e 50 por sessão a cada 15 min (D20, §7.7). */
export const TICKET_CODE_MAX_FAILURES_PER_ACTOR = 5;
export const TICKET_CODE_MAX_FAILURES_PER_OCCURRENCE = 50;
export const TICKET_CODE_FAILURE_WINDOW_MS = 15 * MINUTE_MS;

export function ticketCheckInWindow(
  startsAt: string,
  endsAt: string
): { opensAtMs: number; closesAtMs: number } {
  return {
    opensAtMs: new Date(startsAt).getTime() - TICKET_CHECK_IN_OPENS_BEFORE_MS,
    closesAtMs: new Date(endsAt).getTime() + TICKET_CHECK_IN_CLOSES_AFTER_MS,
  };
}

/** O código aparece para o comprador a partir de 00:00 do dia da sessão em Fortaleza (D20). */
export function ticketCodeVisibleFromMs(startsAt: string): number {
  return businessDayStartMs(startsAt);
}
