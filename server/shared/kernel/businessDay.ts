import { PLATFORM_TIME_ZONE, zonedDateTimeToIso, zonedDayKey } from './timeZones';

/**
 * 00:00 do dia em que `iso` acontece, na hora do lugar (D28), em milissegundos UTC. Sem fuso, o da
 * plataforma (contas do painel e da plataforma; F4).
 */
export function businessDayStartMs(iso: string, timeZone: string = PLATFORM_TIME_ZONE): number {
  return Date.parse(zonedDateTimeToIso(`${zonedDayKey(iso, timeZone)}T00:00`, timeZone));
}
