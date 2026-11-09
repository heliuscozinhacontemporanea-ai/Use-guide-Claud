import { zonedDateTimeToIso, zonedDayKey } from '../../../shared/utils/timeZones';

// Dias da Agenda no fuso do painel (D28). Cada dia é o Date das 00:00 nesse fuso.
const keyOf = (date: Date | string, timeZone: string) =>
  zonedDayKey(new Date(date).toISOString(), timeZone);
const startOf = (key: string, timeZone: string) =>
  new Date(zonedDateTimeToIso(`${key}T00:00`, timeZone));
const shiftKey = (key: string, days: number, months = 0) => {
  const [year, month, day] = key.split('-').map(Number) as [number, number, number];
  return new Date(Date.UTC(year, month - 1 + months, day + days)).toISOString().slice(0, 10);
};

/** 00:00 do dia de `date` no fuso dado. */
export function businessDay(date: Date, timeZone: string): Date {
  return startOf(keyOf(date, timeZone), timeZone);
}

export function addBusinessDays(day: Date, days: number, timeZone: string): Date {
  return startOf(shiftKey(keyOf(day, timeZone), days), timeZone);
}

/** Segunda-feira da semana do dia (a faixa da Agenda vai de segunda a domingo, p05). */
export function weekStart(day: Date, timeZone: string): Date {
  const key = keyOf(day, timeZone);
  const weekday = new Date(`${key}T00:00:00Z`).getUTCDay();
  return startOf(shiftKey(key, -((weekday + 6) % 7)), timeZone);
}

/** Seis semanas, de segunda a domingo, que cobrem o mês do dia. */
export function monthGrid(day: Date, timeZone: string): { month: Date; days: Date[] } {
  const month = startOf(`${keyOf(day, timeZone).slice(0, 8)}01`, timeZone);
  const first = weekStart(month, timeZone);
  return {
    month,
    days: Array.from({ length: 42 }, (_, index) => addBusinessDays(first, index, timeZone)),
  };
}

/** Mesmo dia no fuso dado. */
export function sameBusinessDay(a: Date | string, b: Date | string, timeZone: string): boolean {
  return keyOf(a, timeZone) === keyOf(b, timeZone);
}

/** Mês (0–11) do dia no fuso dado. */
export function businessMonth(day: Date, timeZone: string): number {
  return Number(keyOf(day, timeZone).slice(5, 7)) - 1;
}
