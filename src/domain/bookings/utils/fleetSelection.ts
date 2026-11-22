import type { FleetBookingRequest, PublicFleetDay, PublicOffer } from '../types/bookings';
import { freeVehicles } from './fleetAvailability';

const MINUTE_MS = 60_000;
/** Mesmo id da opção por hora no servidor (HOURLY_PRICE_OPTION_ID). */
export const HOURLY_PRICE_OPTION_ID = 'hourly';

export type FleetMode = 'fixed' | 'custom';

/** O que o comprador escolheu no dia: um período ou saída, ou um início com as horas. */
export interface FleetSelection {
  mode: FleetMode;
  periodId?: string;
  startsAt?: string;
  hours?: number;
}

/** Preço de um veículo, horário do serviço e veículos livres da escolha; só para exibir. */
export interface FleetQuote {
  priceOptionId: string;
  unitAmountMinor: number;
  startsAt: string;
  endsAt: string;
  free: number;
}

type QuoteOffer = Pick<PublicOffer, 'kind' | 'durationMinutes' | 'pricing' | 'fleet'>;

function plus(iso: string, minutes: number): string {
  return new Date(Date.parse(iso) + minutes * MINUTE_MS).toISOString();
}

/**
 * Preço e veículos livres da escolha (F3b). O servidor recalcula tudo na reserva (AGENTS.md §8.5);
 * aqui é só o que a tela mostra.
 */
export function fleetQuote(
  offer: QuoteOffer,
  day: PublicFleetDay,
  selection: FleetSelection
): FleetQuote | null {
  const options = offer.pricing.priceOptions;
  const vehicleOption = options[0];
  if (selection.mode === 'fixed') {
    const period = day.fixed.find((entry) => entry.id === selection.periodId);
    const option =
      offer.kind === 'rental' ? options.find((entry) => entry.id === period?.id) : vehicleOption;
    if (!period || !option) return null;
    return {
      priceOptionId: option.id,
      unitAmountMinor: option.unitAmountMinor,
      startsAt: period.startsAt,
      endsAt: period.endsAt,
      free: period.available,
    };
  }
  const custom = day.custom;
  if (!custom || !selection.startsAt) return null;
  const startMs = Date.parse(selection.startsAt);
  if (custom.mode === 'hours') {
    const hourly = options.find((entry) => entry.id === HOURLY_PRICE_OPTION_ID);
    const hours = selection.hours ?? custom.minHours;
    if (!hourly) return null;
    const endsAt = plus(selection.startsAt, hours * 60);
    return {
      priceOptionId: hourly.id,
      unitAmountMinor: hourly.unitAmountMinor * hours,
      startsAt: selection.startsAt,
      endsAt,
      free: freeVehicles(day.vehicles, day.busy, startMs, Date.parse(endsAt)),
    };
  }
  const travel = offer.durationMinutes ?? 0;
  if (!vehicleOption || travel <= 0) return null;
  return {
    priceOptionId: vehicleOption.id,
    unitAmountMinor: vehicleOption.unitAmountMinor,
    startsAt: selection.startsAt,
    endsAt: plus(selection.startsAt, travel),
    // O veículo vai e volta: a ocupação é o dobro da viagem.
    free: freeVehicles(day.vehicles, day.busy, startMs, startMs + travel * 2 * MINUTE_MS),
  };
}

/** O pedido de dia e horário que vai para o servidor. */
export function fleetRequest(
  date: string,
  selection: FleetSelection,
  day: PublicFleetDay | null
): FleetBookingRequest | null {
  if (selection.mode === 'fixed') {
    return selection.periodId ? { date, periodId: selection.periodId } : null;
  }
  if (!selection.startsAt) return null;
  return day?.custom?.mode === 'hours'
    ? { date, startsAt: selection.startsAt, hours: selection.hours ?? day.custom.minHours }
    : { date, startsAt: selection.startsAt };
}
