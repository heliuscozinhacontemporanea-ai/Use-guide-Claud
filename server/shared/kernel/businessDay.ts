const HOUR_MS = 60 * 60_000;
const DAY_MS = 24 * HOUR_MS;
// America/Fortaleza é UTC−3 o ano todo, sem horário de verão (AGENTS.md §1).
const FORTALEZA_OFFSET_MS = 3 * HOUR_MS;

/** 00:00 em Fortaleza do dia em que `iso` acontece, em milissegundos UTC. */
export function businessDayStartMs(iso: string): number {
  const local = new Date(iso).getTime() - FORTALEZA_OFFSET_MS;
  return Math.floor(local / DAY_MS) * DAY_MS + FORTALEZA_OFFSET_MS;
}
