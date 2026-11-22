import { isoToZonedDateTime, PLATFORM_TIME_ZONE } from '../../../shared/kernel/timeZones';
import { BookingDomainError } from '../errors/bookingDomainError';
import type { BookableOffer } from '../types/bookingTypes';
import { FLEET_STEP_MINUTES, type FleetDay, HOURLY_PRICE_OPTION_ID } from '../types/fleetTypes';
import { fleetDayId, minutesOfDay, placeMinuteIso } from './fleetTime';

const MINUTE_MS = 60_000;

/** O que o comprador escolhe numa oferta por veículo (F3b). */
export interface FleetBookingRequest {
  /** Dia na hora do lugar ("AAAA-MM-DD"). */
  date: string;
  /** Período fixo (aluguel) ou saída (translado). */
  periodId?: string;
  /** Horário personalizado: início escolhido (ISO). */
  startsAt?: string;
  /** Aluguel personalizado: quantas horas. */
  hours?: number;
}

export interface FleetOccupancy {
  serviceStartsAt: string;
  serviceEndsAt: string;
  /** Até quando o veículo fica ocupado: no translado, a volta também conta. */
  occupiedUntil: string;
}

export interface ResolvedFleetBooking extends FleetOccupancy {
  dayId: string;
  serviceMinutes: number;
  /** Opção de preço da reserva: o período, a hora (multiplicada) ou o preço do veículo. */
  priceOption: BookableOffer['pricing']['priceOptions'][number];
}

function unavailable(message: string): never {
  throw new BookingDomainError('SLOT_UNAVAILABLE', message);
}

function invalid(message: string): never {
  throw new BookingDomainError('VALIDATION_ERROR', message);
}

/** Horário de serviço e ocupação de um início (minutos desde 00:00 na hora do lugar). */
export function fleetOccupancy(
  offer: Pick<BookableOffer, 'kind'>,
  date: string,
  startMinutes: number,
  minutes: number,
  timeZone: string
): FleetOccupancy | null {
  if (startMinutes < 0 || minutes <= 0) return null;
  const serviceStartsAt = placeMinuteIso(date, startMinutes, timeZone);
  if (!serviceStartsAt) return null;
  const startMs = Date.parse(serviceStartsAt);
  const serviceEndsAt = new Date(startMs + minutes * MINUTE_MS).toISOString();
  // Translado privativo: o veículo vai e volta (decisão 3 do horário personalizado, F3b).
  const occupiedMinutes = offer.kind === 'transfer' ? minutes * 2 : minutes;
  return {
    serviceStartsAt,
    serviceEndsAt,
    occupiedUntil: new Date(startMs + occupiedMinutes * MINUTE_MS).toISOString(),
  };
}

/** Minuto do dia do início escolhido, conferido com a data e o passo de 30 min. */
function customStartMinutes(request: FleetBookingRequest, timeZone: string): number {
  if (!request.startsAt) invalid('Escolha o horário.');
  const local = isoToZonedDateTime(request.startsAt, timeZone);
  if (local.slice(0, 10) !== request.date) invalid('O horário não é deste dia.');
  const minutes = minutesOfDay(local.slice(11, 16));
  if (minutes === null || minutes % FLEET_STEP_MINUTES !== 0)
    invalid('Horário fora do passo de 30 min.');
  return minutes;
}

/**
 * Confere o pedido do comprador com a oferta e o dia (F3b) e devolve o horário, a ocupação e o preço.
 * Os veículos livres são conferidos de novo na transação da reserva.
 */
export function resolveFleetBooking(params: {
  offer: BookableOffer;
  day: FleetDay | null;
  request: FleetBookingRequest;
  now: Date;
}): ResolvedFleetBooking {
  const { offer, day, request } = params;
  const fleet = offer.fleet;
  if (!fleet) invalid('Esta oferta vende por horários com vagas.');
  if (!day || day.vehicles < 1) unavailable('Dia fechado para reservas.');
  const timeZone = offer.timeZone ?? PLATFORM_TIME_ZONE;
  const options = offer.pricing.priceOptions;

  let startMinutes: number;
  let minutes: number;
  let priceOption = options[0];
  if (request.periodId) {
    const period = fleet.fixed.find((entry) => entry.id === request.periodId);
    if (!period) invalid('Período inválido.');
    startMinutes = minutesOfDay(period.start) ?? -1;
    minutes = period.minutes;
    if (offer.kind === 'rental') priceOption = options.find((option) => option.id === period.id);
  } else {
    const custom = fleet.custom;
    if (!custom) invalid('Esta oferta não tem horário personalizado.');
    startMinutes = customStartMinutes(request, timeZone);
    if (custom.mode === 'hours') {
      const hours = request.hours ?? 0;
      if (!Number.isInteger(hours) || hours < custom.minHours || hours > 24) {
        invalid(`Escolha ao menos ${custom.minHours} h.`);
      }
      minutes = hours * 60;
      const hourly = options.find((option) => option.id === HOURLY_PRICE_OPTION_ID);
      priceOption = hourly
        ? { ...hourly, unitAmountMinor: hourly.unitAmountMinor * hours }
        : undefined;
    } else {
      const from = minutesOfDay(custom.from) ?? 0;
      const to = minutesOfDay(custom.to) ?? 0;
      if (startMinutes < from || startMinutes > to) unavailable('Fora do horário de atendimento.');
      minutes = offer.durationMinutes ?? 0;
    }
  }
  if (!priceOption) invalid('Opção de preço inválida.');
  const occupancy = fleetOccupancy(offer, request.date, startMinutes, minutes, timeZone);
  if (!occupancy) invalid('Horário inválido.');

  const startMs = Date.parse(occupancy.serviceStartsAt);
  const custom = fleet.custom;
  const noticeMs =
    !request.periodId && custom?.mode === 'time' ? custom.minNoticeHours * 3_600_000 : 0;
  if (startMs <= params.now.getTime() + noticeMs)
    unavailable('Horário já passou ou está perto demais.');
  // Aluguel: retirada e devolução dentro do horário do anúncio naquele dia (decisão 2, F3b).
  if (offer.kind === 'rental' && !request.periodId) {
    const opens = day.opensAt ? Date.parse(day.opensAt) : Number.NaN;
    const closes = day.closesAt ? Date.parse(day.closesAt) : Number.NaN;
    if (!(startMs >= opens && Date.parse(occupancy.serviceEndsAt) <= closes)) {
      unavailable('Fora do horário de funcionamento.');
    }
  }
  return {
    ...occupancy,
    dayId: fleetDayId(offer.id, request.date),
    serviceMinutes: minutes,
    priceOption,
  };
}
