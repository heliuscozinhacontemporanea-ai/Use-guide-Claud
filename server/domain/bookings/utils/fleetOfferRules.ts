import { BookingDomainError } from '../errors/bookingDomainError';
import type { BookableItem } from '../ports/bookableItemLookupPort';
import type { BookableOffer, BookableOfferKind } from '../types/bookingTypes';
import { type FleetSchedule, HOURLY_PRICE_OPTION_ID } from '../types/fleetTypes';
import { minutesOfDay } from './fleetTime';

type KindFields = Pick<
  BookableOffer,
  | 'pricing'
  | 'durationMinutes'
  | 'sellingUnit'
  | 'groupMaxPeople'
  | 'vehicle'
  | 'route'
  | 'requiresDriverLicense'
  | 'fleet'
>;

const DAY_MINUTES = 24 * 60;
const MAX_NOTICE_HOURS = 72;

function invalid(message: string): never {
  throw new BookingDomainError('VALIDATION_ERROR', message);
}

function assertTime(value: string): number {
  const minutes = minutesOfDay(value);
  if (minutes === null) invalid('Horário inválido.');
  return minutes;
}

function assertUniqueStarts(fleet: FleetSchedule): void {
  const ids = new Set(fleet.fixed.map((period) => period.id));
  if (ids.size !== fleet.fixed.length) invalid('Período repetido.');
}

/** Aluguel: cada período fixo tem o seu preço (mesmo ID) e o preço por hora fica na opção `hourly`. */
function assertRentalSchedule(fields: KindFields, fleet: FleetSchedule): void {
  for (const period of fleet.fixed) {
    const start = assertTime(period.start);
    if (period.minutes < 30 || start + period.minutes > DAY_MINUTES) {
      invalid('O período precisa ter ao menos 30 min e terminar no mesmo dia.');
    }
  }
  const custom = fleet.custom;
  if (custom && (custom.mode !== 'hours' || custom.minHours < 1 || custom.minHours > 24)) {
    invalid('Informe o mínimo de horas, de 1 a 24.');
  }
  if (fleet.fixed.length === 0 && !custom) {
    invalid('Informe ao menos um período ou o horário personalizado.');
  }
  const expected = [
    ...fleet.fixed.map((period) => period.id),
    ...(custom ? [HOURLY_PRICE_OPTION_ID] : []),
  ];
  const priced = fields.pricing.priceOptions.map((option) => option.id);
  if (priced.length !== expected.length || expected.some((id) => !priced.includes(id))) {
    invalid('Cada período e o horário personalizado precisam de um preço.');
  }
}

/** Translado privativo: saídas na hora do lugar e, se houver, o atendimento do horário escolhido. */
function assertTransferSchedule(fields: KindFields, fleet: FleetSchedule): void {
  for (const departure of fleet.fixed) assertTime(departure.start);
  const custom = fleet.custom;
  if (custom) {
    if (custom.mode !== 'time') invalid('Horário personalizado inválido.');
    if (assertTime(custom.from) >= assertTime(custom.to)) {
      invalid('O atendimento precisa começar antes de terminar.');
    }
    if (custom.minNoticeHours < 0 || custom.minNoticeHours > MAX_NOTICE_HOURS) {
      invalid('Antecedência mínima de 0 a 72 h.');
    }
  }
  if (fleet.fixed.length === 0 && !custom) {
    invalid('Informe ao menos uma saída ou o horário personalizado.');
  }
  if (fields.pricing.priceOptions.length !== 1)
    invalid('O translado privativo tem um preço por veículo.');
}

/**
 * Campos de cada tipo, conferidos com o anúncio (F3b, D34): o aluguel escolhe um veículo do anúncio, o
 * translado escolhe um trecho; aluguel e translado privativo vendem por veículo em dias abertos.
 */
export function assertKindFields(
  kind: BookableOfferKind,
  fields: KindFields,
  item: BookableItem
): void {
  if (kind === 'rental') {
    if (!fields.vehicle || !(item.vehicleTypes ?? []).includes(fields.vehicle)) {
      invalid('Escolha um dos veículos do anúncio.');
    }
    if (fields.sellingUnit !== 'group' || !fields.groupMaxPeople) {
      invalid('Aluguel é vendido por veículo: informe quantas pessoas cabem em cada um.');
    }
    if (!fields.fleet) invalid('Informe os períodos ou o horário personalizado.');
    assertUniqueStarts(fields.fleet);
    assertRentalSchedule(fields, fields.fleet);
    return;
  }
  if (kind === 'transfer') {
    const route = fields.route;
    const known = (item.transferRoutes ?? []).some(
      (entry) => entry.from === route?.from && entry.to === route?.to
    );
    if (!route || !known) invalid('Escolha um dos trechos do anúncio.');
    if (!fields.durationMinutes) invalid('Informe o tempo de viagem.');
    if (fields.sellingUnit === 'group') {
      if (!fields.fleet) invalid('Informe as saídas ou o horário personalizado.');
      assertUniqueStarts(fields.fleet);
      assertTransferSchedule(fields, fields.fleet);
    } else if (fields.fleet) {
      invalid('Translado compartilhado usa horários com lugares, como o passeio.');
    }
    if (fields.vehicle || fields.requiresDriverLicense) invalid('Campo de aluguel em translado.');
    return;
  }
  if (fields.vehicle || fields.route || fields.fleet || fields.requiresDriverLicense) {
    invalid('Campos de aluguel ou translado nesta oferta.');
  }
}

/** No translado, cada saída dura o tempo de viagem da oferta. */
export function normalizeFleet(
  kind: BookableOfferKind,
  fields: Pick<KindFields, 'fleet' | 'durationMinutes'>
): FleetSchedule | undefined {
  const { fleet, durationMinutes } = fields;
  if (kind !== 'transfer' || !fleet || !durationMinutes) return fleet;
  return {
    ...fleet,
    fixed: fleet.fixed.map((departure) => ({ ...departure, minutes: durationMinutes })),
  };
}
