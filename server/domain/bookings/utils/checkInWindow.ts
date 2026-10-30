import { serviceEndsAtMs } from './serviceTime';

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

/** "Cliente não apareceu" só 30 min depois do "Cheguei" (D20). */
export const NO_SHOW_WAIT_MS = 30 * MINUTE_MS;
/** "O prestador não veio" a partir de 30 min depois do horário (D20). */
export const PROVIDER_ABSENT_AFTER_MS = 30 * MINUTE_MS;
/** Prazo do prestador para responder ao "O prestador não veio" (D20). */
export const ABSENCE_RESPONSE_MS = 2 * HOUR_MS;
/** Prazo do comprador para responder "O serviço aconteceu?" (D20). */
export const SERVICE_CONFIRMATION_MS = 72 * HOUR_MS;

/** Entrada de atração privada: 5 erros por pessoa e 50 por horário a cada 15 min (D20, §7.7). */
export const ENTRY_MAX_FAILURES_PER_ACTOR = 5;
export const ENTRY_MAX_FAILURES_PER_SLOT = 50;

/**
 * Entrada vale o dia do horário até o fechamento (D20): até o fim do horário, ou o fim da duração,
 * ou, sem nenhum dos dois, o fim do dia em Fortaleza.
 */
export function entryWindow(
  slot: { startsAt: string; endsAt?: string },
  durationMinutes?: number
): { opensAtMs: number; closesAtMs: number } {
  const startMs = new Date(slot.startsAt).getTime();
  const closesAtMs = slot.endsAt
    ? new Date(slot.endsAt).getTime()
    : durationMinutes
      ? serviceEndsAtMs(slot.startsAt, durationMinutes)
      : checkInCodeVisibleFromMs(slot.startsAt) + DAY_MS - 1;
  return { opensAtMs: startMs - CHECK_IN_OPENS_BEFORE_MS, closesAtMs };
}

// Check-in sem internet chega depois: aceita até 24 h de atraso e 1 min de relógio adiantado.
const OFFLINE_MAX_DELAY_MS = 24 * HOUR_MS;
const CLOCK_SKEW_MS = MINUTE_MS;

/** Hora que vale para o check-in: a do aparelho quando foi feito sem internet; null se for inválida. */
export function resolveCheckInTime(capturedAt: string | undefined, nowMs: number): number | null {
  if (!capturedAt) return nowMs;
  const capturedMs = new Date(capturedAt).getTime();
  if (
    Number.isNaN(capturedMs) ||
    capturedMs > nowMs + CLOCK_SKEW_MS ||
    capturedMs < nowMs - OFFLINE_MAX_DELAY_MS
  ) {
    return null;
  }
  return Math.min(capturedMs, nowMs);
}
