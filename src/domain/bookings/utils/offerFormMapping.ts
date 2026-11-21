import type { OfferFormValues } from '../schemas/offerFormSchema';
import type {
  BookableGuideItem,
  LocalizedText,
  OfferFields,
  OfferKind,
  PartnerOffer,
  PriceOption,
} from '../types/bookings';
import { HOURLY_PRICE_OPTION_ID } from './fleetSelection';
import { minorToReaisInput, parseReaisToMinor } from './money';

const MINUTES_PER_HOUR = 60;
// Opção única do translado privativo: o preço é por veículo (F3b).
const VEHICLE_OPTION_ID = 'vehicle';

// O texto vai na chave pt-BR do modelo (obrigatória) até a tradução automática da D5 existir; salvar
// apaga as traduções escritas à mão antes da F3, que deixariam de acompanhar o texto.
function toLocalized(value: string): LocalizedText {
  return { 'pt-BR': value.trim() };
}

function minor(amount: string): number {
  return parseReaisToMinor(amount) ?? 0;
}

function hoursLabel(minutes: number): string {
  const hours = Math.floor(minutes / MINUTES_PER_HOUR);
  const rest = minutes % MINUTES_PER_HOUR;
  return rest ? `${hours} h ${String(rest).padStart(2, '0')}` : `${hours} h`;
}

function perPersonPricing(values: OfferFormValues): OfferFields['pricing'] {
  return {
    currency: 'BRL',
    priceOptions: values.priceOptions.map((option) => ({
      id: option.id,
      label: { 'pt-BR': option.label.trim() },
      unitAmountMinor: minor(option.amount),
    })),
  };
}

// Rótulos sem palavras (horário e duração, trecho): valem em qualquer idioma.
function rentalFields(values: OfferFormValues): Partial<OfferFields> {
  const periods = values.periods.map((period) => ({
    id: period.id,
    start: period.start,
    minutes: period.hours * MINUTES_PER_HOUR + period.mins,
    amount: period.amount,
  }));
  const priceOptions: PriceOption[] = periods.map((period) => ({
    id: period.id,
    label: { 'pt-BR': `${period.start} · ${hoursLabel(period.minutes)}` },
    unitAmountMinor: minor(period.amount),
  }));
  if (values.hourlyEnabled) {
    priceOptions.push({
      id: HOURLY_PRICE_OPTION_ID,
      label: { 'pt-BR': '1 h' },
      unitAmountMinor: minor(values.hourlyAmount),
    });
  }
  return {
    vehicle: values.vehicle,
    requiresDriverLicense: values.requiresDriverLicense,
    sellingUnit: 'group',
    groupMaxPeople: values.groupMaxPeople,
    pricing: { currency: 'BRL', priceOptions },
    fleet: {
      fixed: periods.map(({ id, start, minutes }) => ({ id, start, minutes })),
      ...(values.hourlyEnabled ? { custom: { mode: 'hours', minHours: values.minHours } } : {}),
    },
  };
}

function transferFields(values: OfferFormValues): Partial<OfferFields> {
  const route = { from: values.routeFrom, to: values.routeTo };
  if (values.sellingUnit !== 'group') {
    return { route, sellingUnit: 'person', pricing: perPersonPricing(values) };
  }
  const duration = values.durationHours * MINUTES_PER_HOUR + values.durationMins;
  return {
    route,
    sellingUnit: 'group',
    groupMaxPeople: values.groupMaxPeople,
    pricing: {
      currency: 'BRL',
      priceOptions: [
        {
          id: VEHICLE_OPTION_ID,
          label: { 'pt-BR': `${route.from} → ${route.to}` },
          unitAmountMinor: minor(values.vehicleAmount),
        },
      ],
    },
    fleet: {
      fixed: values.departures.map(({ id, start }) => ({ id, start, minutes: duration })),
      ...(values.anyTimeEnabled
        ? {
            custom: {
              mode: 'time',
              from: values.anyTimeFrom,
              to: values.anyTimeTo,
              minNoticeHours: values.minNoticeHours,
            },
          }
        : {}),
    },
  };
}

/** Converte o formulário (valores em reais digitados) no corpo da API (centavos inteiros). */
export function offerFormToFields(values: OfferFormValues): OfferFields {
  const description = toLocalized(values.description);
  const group = values.kind === 'tour' && values.sellingUnit === 'group';
  // Translado que busca no endereço do cliente não tem ponto de encontro (o campo some no editor).
  const meetingPoint =
    values.kind === 'transfer' && values.pickupMode === 'buyer_address'
      ? ''
      : values.meetingPoint.trim();
  const common = {
    title: toLocalized(values.title),
    ...(description['pt-BR'] ? { description } : {}),
    ...(meetingPoint ? { meetingPoint: { address: meetingPoint } } : {}),
    cancellationPolicy: values.cancellationPolicy,
    maxParticipantsPerBooking: values.maxParticipantsPerBooking,
  };
  if (values.kind === 'rental') {
    return {
      ...common,
      ...rentalFields(values),
      pickupMode: values.pickupMode,
      requiresParticipantNames: false,
    } as OfferFields;
  }
  if (values.kind === 'transfer') {
    return {
      ...common,
      ...transferFields(values),
      durationMinutes: values.durationHours * MINUTES_PER_HOUR + values.durationMins,
      pickupMode: values.pickupMode,
      requiresParticipantNames: false,
    } as OfferFields;
  }
  return {
    ...common,
    pricing: perPersonPricing(values),
    durationMinutes: values.durationHours * MINUTES_PER_HOUR + values.durationMins,
    // Entrada de atração é sempre no local e por pessoa; buscar o cliente e vender por grupo só no passeio (D20).
    pickupMode: values.kind === 'tour' ? values.pickupMode : 'meeting_point',
    ...(group
      ? { sellingUnit: 'group', groupMaxPeople: values.groupMaxPeople }
      : { sellingUnit: 'person' }),
    // Grupo não tem nome por pessoa: o cliente decide quem leva.
    requiresParticipantNames: !group && values.requiresParticipantNames,
  };
}

/** Listas que só uma parte dos tipos usa começam vazias ou com um exemplo editável. */
function blankKindFields(kind: OfferKind, item?: Pick<BookableGuideItem, 'vehicles' | 'routes'>) {
  const route = item?.routes?.[0];
  return {
    vehicle: item?.vehicles?.[0] ?? '',
    requiresDriverLicense: false,
    periods: kind === 'rental' ? [{ id: 'p1', start: '08:00', hours: 4, mins: 0, amount: '' }] : [],
    hourlyEnabled: false,
    minHours: 2,
    hourlyAmount: '',
    routeFrom: route?.from ?? '',
    routeTo: route?.to ?? '',
    vehicleAmount: '',
    departures: [],
    anyTimeEnabled: kind === 'transfer',
    anyTimeFrom: '06:00',
    anyTimeTo: '22:00',
    minNoticeHours: 12,
  };
}

export function offerToFormValues(offer: PartnerOffer): OfferFormValues {
  const minutes = offer.durationMinutes ?? MINUTES_PER_HOUR;
  const options = offer.pricing.priceOptions;
  const custom = offer.fleet?.custom;
  const amountOf = (id: string) => {
    const option = options.find((entry) => entry.id === id);
    return option ? minorToReaisInput(option.unitAmountMinor) : '';
  };
  const fleetOffer = Boolean(offer.fleet);
  return {
    ...blankKindFields(offer.kind),
    kind: offer.kind,
    title: offer.title['pt-BR'],
    description: offer.description?.['pt-BR'] ?? '',
    priceOptions: fleetOffer
      ? []
      : options.map((option) => ({
          id: option.id,
          label: option.label['pt-BR'],
          amount: minorToReaisInput(option.unitAmountMinor),
        })),
    durationHours: Math.floor(minutes / MINUTES_PER_HOUR),
    durationMins: minutes % MINUTES_PER_HOUR,
    meetingPoint: offer.meetingPoint?.address ?? '',
    pickupMode: offer.pickupMode ?? 'meeting_point',
    cancellationPolicy: offer.cancellationPolicy,
    maxParticipantsPerBooking: offer.maxParticipantsPerBooking,
    requiresParticipantNames: offer.requiresParticipantNames,
    sellingUnit: offer.sellingUnit ?? 'person',
    groupMaxPeople: offer.groupMaxPeople ?? 4,
    vehicle: offer.vehicle ?? '',
    requiresDriverLicense: offer.requiresDriverLicense ?? false,
    periods:
      offer.kind === 'rental'
        ? (offer.fleet?.fixed ?? []).map((period) => ({
            id: period.id,
            start: period.start,
            hours: Math.floor(period.minutes / MINUTES_PER_HOUR),
            mins: period.minutes % MINUTES_PER_HOUR,
            amount: amountOf(period.id),
          }))
        : [],
    hourlyEnabled: custom?.mode === 'hours',
    minHours: custom?.mode === 'hours' ? custom.minHours : 2,
    hourlyAmount: amountOf(HOURLY_PRICE_OPTION_ID),
    routeFrom: offer.route?.from ?? '',
    routeTo: offer.route?.to ?? '',
    vehicleAmount: offer.kind === 'transfer' && fleetOffer ? amountOf(VEHICLE_OPTION_ID) : '',
    departures:
      offer.kind === 'transfer'
        ? (offer.fleet?.fixed ?? []).map(({ id, start }) => ({ id, start }))
        : [],
    anyTimeEnabled: custom?.mode === 'time',
    anyTimeFrom: custom?.mode === 'time' ? custom.from : '06:00',
    anyTimeTo: custom?.mode === 'time' ? custom.to : '22:00',
    minNoticeHours: custom?.mode === 'time' ? custom.minNoticeHours : 12,
  };
}

export function emptyOfferFormValues(
  kind: OfferKind,
  item?: Pick<BookableGuideItem, 'vehicles' | 'routes'>
): OfferFormValues {
  const vehicleSale = kind === 'rental' || kind === 'transfer';
  return {
    ...blankKindFields(kind, item),
    kind,
    title: '',
    description: '',
    priceOptions: vehicleSale ? [] : [{ id: 'adult', label: '', amount: '' }],
    durationHours: kind === 'transfer' ? 1 : 2,
    durationMins: 0,
    meetingPoint: '',
    pickupMode: kind === 'transfer' ? 'buyer_address' : 'meeting_point',
    cancellationPolicy: kind === 'transfer' ? 'transfer_flexible' : 'flexible',
    maxParticipantsPerBooking: vehicleSale ? 2 : 8,
    requiresParticipantNames: false,
    sellingUnit: vehicleSale ? 'group' : 'person',
    groupMaxPeople: kind === 'rental' ? 2 : 4,
  };
}
