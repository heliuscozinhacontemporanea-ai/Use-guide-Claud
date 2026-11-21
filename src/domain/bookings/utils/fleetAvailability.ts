import type { FleetBusy, PublicFleetDay, PublicOffer } from '../types/bookings';

const MINUTE_MS = 60_000;
/** Inícios do horário personalizado: de 30 em 30 minutos (o servidor confere o mesmo passo). */
export const FLEET_STEP_MINUTES = 30;

/** Veículos livres durante todo o intervalo [startMs, endMs). */
export function freeVehicles(
  vehicles: number,
  busy: readonly FleetBusy[],
  startMs: number,
  endMs: number
): number {
  const inside = busy.filter(
    (entry) => Date.parse(entry.startsAt) < endMs && Date.parse(entry.endsAt) > startMs
  );
  // O pico acontece no início de alguma ocupação (ou no início do intervalo).
  const instants = [
    startMs,
    ...inside.map((entry) => Math.max(startMs, Date.parse(entry.startsAt))),
  ];
  const peak = Math.max(
    0,
    ...instants.map((instant) =>
      inside
        .filter(
          (entry) => Date.parse(entry.startsAt) <= instant && Date.parse(entry.endsAt) > instant
        )
        .reduce((sum, entry) => sum + entry.units, 0)
    )
  );
  return Math.max(0, vehicles - peak);
}

export interface CustomStart {
  startsAt: string;
  /** Veículos livres para o mínimo de horas (aluguel) ou para ida e volta (translado). */
  free: number;
}

/**
 * Inícios do horário personalizado no dia: aluguel dentro do horário do anúncio, com o mínimo de horas;
 * translado dentro do atendimento, a partir da antecedência mínima, ocupando ida e volta.
 */
export function customStarts(
  offer: Pick<PublicOffer, 'kind' | 'durationMinutes'>,
  day: PublicFleetDay,
  nowMs: number,
  placeIso: (date: string, time: string) => string | null
): CustomStart[] {
  const custom = day.custom;
  if (!custom) return [];
  let firstMs: number;
  let lastMs: number;
  let occupiedMinutes: number;
  if (custom.mode === 'hours') {
    if (!day.opensAt || !day.closesAt) return [];
    occupiedMinutes = custom.minHours * 60;
    firstMs = Date.parse(day.opensAt);
    lastMs = Date.parse(day.closesAt) - occupiedMinutes * MINUTE_MS;
  } else {
    const from = placeIso(day.date, custom.from);
    const to = placeIso(day.date, custom.to);
    if (!from || !to) return [];
    occupiedMinutes = (offer.durationMinutes ?? 0) * 2;
    firstMs = Date.parse(from);
    lastMs = Date.parse(to);
  }
  const earliestMs = Math.max(nowMs, Date.parse(custom.earliestStartsAt));
  const starts: CustomStart[] = [];
  for (let ms = firstMs; ms <= lastMs; ms += FLEET_STEP_MINUTES * MINUTE_MS) {
    if (ms <= earliestMs) continue;
    starts.push({
      startsAt: new Date(ms).toISOString(),
      free: freeVehicles(day.vehicles, day.busy, ms, ms + occupiedMinutes * MINUTE_MS),
    });
  }
  return starts;
}

/** Maior número de horas a partir do início, até o fechamento e com ao menos um veículo livre. */
export function maxHoursFrom(day: PublicFleetDay, startsAt: string, minHours: number): number {
  if (!day.closesAt) return minHours;
  const startMs = Date.parse(startsAt);
  const limit = Math.floor((Date.parse(day.closesAt) - startMs) / (60 * MINUTE_MS));
  let hours = minHours;
  while (
    hours + 1 <= limit &&
    freeVehicles(day.vehicles, day.busy, startMs, startMs + (hours + 1) * 60 * MINUTE_MS) > 0
  ) {
    hours += 1;
  }
  return hours;
}

/** Os próximos `count` dias do calendário a partir de `today` ("AAAA-MM-DD", na hora do lugar). */
export function nextPlaceDates(today: string, count: number): string[] {
  const base = Date.parse(`${today}T12:00:00.000Z`);
  return Array.from({ length: count }, (_, index) =>
    new Date(base + index * 86_400_000).toISOString().slice(0, 10)
  );
}
