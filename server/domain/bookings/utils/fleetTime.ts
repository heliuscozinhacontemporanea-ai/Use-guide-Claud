import { zonedDateTimeToIso } from '../../../shared/kernel/timeZones';
import type { FleetDay, FleetHold } from '../types/fleetTypes';

const MINUTE_MS = 60_000;
const DAY_MS = 24 * 60 * MINUTE_MS;
const HH_MM = /^([01]\d|2[0-3]):([0-5]\d)$/;
const DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** "HH:MM" → minutos desde 00:00; null se o formato não bater. */
export function minutesOfDay(value: string): number | null {
  const match = HH_MM.exec(value);
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

/** Instante (ISO UTC) de `minutes` depois da meia-noite do dia, na hora do lugar. */
export function placeMinuteIso(date: string, minutes: number, timeZone: string): string {
  const midnight = zonedDateTimeToIso(`${date}T00:00`, timeZone);
  if (!midnight) return '';
  return new Date(Date.parse(midnight) + minutes * MINUTE_MS).toISOString();
}

/** Dia da semana da data (0 = domingo); o calendário é o mesmo em qualquer fuso. */
export function weekdayOf(date: string): number {
  const match = DATE.exec(date);
  if (!match) return -1;
  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))).getUTCDay();
}

/** Datas de `from` a `to` (inclusive) nos dias da semana pedidos, no máximo `limit`. */
export function datesBetween(
  from: string,
  to: string,
  weekdays: number[],
  limit: number
): string[] {
  const start = Date.parse(`${from}T00:00:00Z`);
  const end = Date.parse(`${to}T00:00:00Z`);
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return [];
  const dates: string[] = [];
  for (let ms = start; ms <= end && dates.length < limit; ms += DAY_MS) {
    const date = new Date(ms).toISOString().slice(0, 10);
    if (weekdays.includes(weekdayOf(date))) dates.push(date);
  }
  return dates;
}

/** Maior número de veículos ocupados ao mesmo tempo dentro de [startsAt, endsAt). */
export function peakUnits(holds: readonly FleetHold[], startsAt: string, endsAt: string): number {
  const from = Date.parse(startsAt);
  const to = Date.parse(endsAt);
  const inside = holds.filter(
    (hold) => Date.parse(hold.startsAt) < to && Date.parse(hold.endsAt) > from
  );
  // O pico acontece no início de alguma ocupação (ou no início do intervalo pedido).
  const instants = [from, ...inside.map((hold) => Math.max(from, Date.parse(hold.startsAt)))];
  let peak = 0;
  for (const instant of instants) {
    const busy = inside
      .filter((hold) => Date.parse(hold.startsAt) <= instant && Date.parse(hold.endsAt) > instant)
      .reduce((sum, hold) => sum + hold.units, 0);
    peak = Math.max(peak, busy);
  }
  return peak;
}

/** Veículos livres durante todo o intervalo, sem contar as reservas em `except` (remarcação). */
export function freeUnits(
  day: Pick<FleetDay, 'vehicles' | 'holds'>,
  startsAt: string,
  endsAt: string,
  except: ReadonlySet<string> = new Set()
): number {
  const holds = day.holds.filter((hold) => !except.has(hold.bookingId));
  return Math.max(0, day.vehicles - peakUnits(holds, startsAt, endsAt));
}

/** ID do dia aberto de uma oferta. */
export function fleetDayId(offerId: string, date: string): string {
  return `${offerId}__${date}`;
}

/** Chave do horário de serviço no índice do dia. */
export function fleetSlotKey(startsAt: string, endsAt: string): string {
  return `${startsAt}|${endsAt}`;
}
