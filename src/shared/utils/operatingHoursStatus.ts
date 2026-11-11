import { isoToZonedDateTime, PLATFORM_TIME_ZONE } from './timeZones';

/** Chaves gravadas em `operatingHours`, de domingo a sábado (cadastro do parceiro). */
export const DAY_KEYS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

export type OperatingHours = Record<string, { open: string; close: string; closed: boolean }>;

export type OperatingStatus =
  | { state: 'open'; closesAt: string }
  | { state: 'closed'; opensAt: string }
  | { state: 'closedToday' };

const minutes = (time: string) => {
  const [hours = 0, mins = 0] = time.split(':').map(Number);
  return hours * 60 + mins;
};

/** Dia da semana (0 = domingo) e minuto do dia, na hora do lugar (D28). */
export function placeClock(now: Date, timeZone: string): { weekday: number; minute: number } {
  const local = isoToZonedDateTime(now.toISOString(), timeZone);
  const weekday = new Date(`${local.slice(0, 10)}T00:00:00Z`).getUTCDay();
  return { weekday, minute: minutes(local.slice(11, 16)) };
}

/**
 * Aberto ou fechado agora, na hora do lugar do anúncio (não na do celular de quem olha). Horário
 * que passa da meia-noite (18:00 às 02:00) conta a madrugada no dia em que abriu. `null` sem horário.
 */
export function getOperatingStatus(
  hours: OperatingHours | undefined,
  now: Date,
  timeZone: string = PLATFORM_TIME_ZONE
): OperatingStatus | null {
  if (!hours || Object.keys(hours).length === 0) return null;
  const { weekday, minute } = placeClock(now, timeZone);
  const yesterday = hours[DAY_KEYS[(weekday + 6) % 7] ?? ''];
  if (
    yesterday &&
    !yesterday.closed &&
    minutes(yesterday.close) < minutes(yesterday.open) &&
    minute < minutes(yesterday.close)
  ) {
    return { state: 'open', closesAt: yesterday.close };
  }
  const today = hours[DAY_KEYS[weekday] ?? ''];
  if (!today || today.closed) return { state: 'closedToday' };
  const open = minutes(today.open);
  const close = minutes(today.close);
  const overnight = close < open;
  const isOpen = overnight ? minute >= open : minute >= open && minute < close;
  if (isOpen) return { state: 'open', closesAt: today.close };
  if (minute < open) return { state: 'closed', opensAt: today.open };
  return { state: 'closedToday' };
}
