import { isoToZonedDateTime, PLATFORM_TIME_ZONE } from '../../../shared/utils/timeZones';
import type { FleetBusy, PartnerFleetDay, PartnerOffer } from '../types/bookings';

export type FleetBusyKind = 'period' | 'departure' | 'custom';

const MINUTE_MS = 60_000;

/**
 * De onde veio a ocupação: um período fixo (aluguel), uma saída (translado) ou o horário
 * personalizado. A ocupação do translado conta ida e volta (2 × viagem).
 */
export function fleetBusyKind(
  offer: Pick<PartnerOffer, 'kind' | 'fleet'>,
  busy: FleetBusy,
  timeZone = PLATFORM_TIME_ZONE
): FleetBusyKind {
  const start = isoToZonedDateTime(busy.startsAt, timeZone).slice(11, 16);
  const minutes = (Date.parse(busy.endsAt) - Date.parse(busy.startsAt)) / MINUTE_MS;
  const factor = offer.kind === 'transfer' ? 2 : 1;
  const fixed = offer.fleet?.fixed.some(
    (period) => period.start === start && period.minutes * factor === minutes
  );
  if (!fixed) return 'custom';
  return offer.kind === 'transfer' ? 'departure' : 'period';
}

/** Trecho do dia que a barra de ocupação mostra: o horário do anúncio ou o das ocupações. */
export function fleetDayWindow(day: PartnerFleetDay): { startMs: number; endMs: number } | null {
  const starts = day.busy.map((busy) => Date.parse(busy.startsAt));
  const ends = day.busy.map((busy) => Date.parse(busy.endsAt));
  if (day.opensAt) starts.push(Date.parse(day.opensAt));
  if (day.closesAt) ends.push(Date.parse(day.closesAt));
  if (starts.length === 0 || ends.length === 0) return null;
  const startMs = Math.min(...starts);
  const endMs = Math.max(...ends);
  return endMs > startMs ? { startMs, endMs } : null;
}
