import { PLATFORM_TIME_ZONE, zonedDateTimeToIso, zonedDayKey } from './timeZones';

/**
 * 00:00 do dia em que `iso` acontece, na hora do lugar (D28), em milissegundos UTC. Sem fuso, o da
 * plataforma.
 */
export function businessDayStartMs(iso: string, timeZone: string = PLATFORM_TIME_ZONE): number {
  return Date.parse(zonedDateTimeToIso(`${zonedDayKey(iso, timeZone)}T00:00`, timeZone));
}

/** 00:00 do dia 1 do mês de `iso` (ou de `monthsBack` meses antes), no fuso dado, em ms UTC. */
export function businessMonthStartMs(
  iso: string,
  timeZone: string = PLATFORM_TIME_ZONE,
  monthsBack = 0
): number {
  const [year, month] = zonedDayKey(iso, timeZone).split('-').map(Number) as [number, number];
  const first = new Date(Date.UTC(year, month - 1 - monthsBack, 1)).toISOString().slice(0, 10);
  return Date.parse(zonedDateTimeToIso(`${first}T00:00`, timeZone));
}
