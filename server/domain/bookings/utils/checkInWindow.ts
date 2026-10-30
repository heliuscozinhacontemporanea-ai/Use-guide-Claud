const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
// America/Fortaleza é UTC−3 o ano todo, sem horário de verão (AGENTS.md §1).
const FORTALEZA_OFFSET_MS = 3 * HOUR_MS;

/** Check-in de 2 h antes do início até 12 h depois do fim (D20). */
export const CHECK_IN_OPENS_BEFORE_MS = 2 * HOUR_MS;
export const CHECK_IN_CLOSES_AFTER_MS = 12 * HOUR_MS;
/** No máximo 5 códigos errados por horário a cada 15 min (D20, exceção do §7.7). */
export const CHECK_IN_MAX_FAILURES = 5;
export const CHECK_IN_FAILURE_WINDOW_MS = 15 * MINUTE_MS;

export function serviceEndsAtMs(startsAt: string, durationMinutes?: number): number {
  return new Date(startsAt).getTime() + (durationMinutes ?? 0) * MINUTE_MS;
}

/** 00:00 do dia do serviço em Fortaleza: a partir daí o comprador vê o código. */
export function checkInCodeVisibleFromMs(startsAt: string): number {
  const local = new Date(startsAt).getTime() - FORTALEZA_OFFSET_MS;
  return Math.floor(local / DAY_MS) * DAY_MS + FORTALEZA_OFFSET_MS;
}

export function checkInWindow(
  startsAt: string,
  durationMinutes?: number
): { opensAtMs: number; closesAtMs: number } {
  return {
    opensAtMs: new Date(startsAt).getTime() - CHECK_IN_OPENS_BEFORE_MS,
    closesAtMs: serviceEndsAtMs(startsAt, durationMinutes) + CHECK_IN_CLOSES_AFTER_MS,
  };
}
