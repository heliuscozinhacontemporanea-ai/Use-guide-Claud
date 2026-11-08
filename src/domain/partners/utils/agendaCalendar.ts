const HOUR_MS = 60 * 60_000;
const DAY_MS = 24 * HOUR_MS;
// America/Fortaleza é UTC−3 o ano todo (AGENTS.md §1).
const OFFSET_MS = 3 * HOUR_MS;

/** 00:00 em Fortaleza do dia de `date`, como Date. */
export function businessDay(date: Date): Date {
  const local = date.getTime() - OFFSET_MS;
  return new Date(Math.floor(local / DAY_MS) * DAY_MS + OFFSET_MS);
}

export function addBusinessDays(day: Date, days: number): Date {
  return new Date(day.getTime() + days * DAY_MS);
}

/** Segunda-feira da semana do dia (a faixa da Agenda vai de segunda a domingo, p05). */
export function weekStart(day: Date): Date {
  const start = businessDay(day);
  const weekday = new Date(start.getTime() - OFFSET_MS).getUTCDay();
  return addBusinessDays(start, -((weekday + 6) % 7));
}

/** Seis semanas, de segunda a domingo, que cobrem o mês do dia. */
export function monthGrid(day: Date): { month: Date; days: Date[] } {
  const local = new Date(businessDay(day).getTime() - OFFSET_MS);
  const month = new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), 1) + OFFSET_MS);
  const first = weekStart(month);
  return { month, days: Array.from({ length: 42 }, (_, index) => addBusinessDays(first, index)) };
}

/** Mesmo dia no fuso do negócio. */
export function sameBusinessDay(a: Date | string, b: Date | string): boolean {
  return businessDay(new Date(a)).getTime() === businessDay(new Date(b)).getTime();
}

/** Mês (0–11) do dia no fuso do negócio. */
export function businessMonth(day: Date): number {
  return new Date(businessDay(day).getTime() - OFFSET_MS).getUTCMonth();
}
