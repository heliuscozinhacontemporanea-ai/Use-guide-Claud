// Horário de passeio é sempre exibido no fuso do negócio (AGENTS.md §1 e §12.4).
const BUSINESS_TIME_ZONE = 'America/Fortaleza';
const FORTALEZA_OFFSET_MS = 3 * 60 * 60 * 1000;
const DAY_MS = 86_400_000;

export function formatSlotDateTime(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: BUSINESS_TIME_ZONE,
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function formatSlotTime(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: BUSINESS_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function formatDayLabel(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: BUSINESS_TIME_ZONE,
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  }).format(new Date(iso));
}

/** Data local de Fortaleza (AAAA-MM-DD) de um instante; agrupa horários por dia. */
export function fortalezaDateKey(iso: string): string {
  return new Date(new Date(iso).getTime() - FORTALEZA_OFFSET_MS).toISOString().slice(0, 10);
}

/** Início (domingo 00:00 em Fortaleza) da semana que contém `reference`, em UTC. */
export function startOfFortalezaWeek(reference: Date): Date {
  const local = new Date(reference.getTime() - FORTALEZA_OFFSET_MS);
  const midnightLocal = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate());
  return new Date(midnightLocal - local.getUTCDay() * DAY_MS + FORTALEZA_OFFSET_MS);
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

/** Converte "AAAA-MM-DDTHH:MM" digitado (hora de Fortaleza) em ISO UTC. */
export function fortalezaInputToIso(value: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const [, y, m, d, h, min] = match.map(Number) as [number, number, number, number, number, number];
  return new Date(Date.UTC(y, m - 1, d, h, min) + FORTALEZA_OFFSET_MS).toISOString();
}
