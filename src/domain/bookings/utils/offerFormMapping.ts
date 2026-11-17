import type { OfferFormValues } from '../schemas/offerFormSchema';
import type { LocalizedText, OfferFields, PartnerOffer } from '../types/bookings';
import { minorToReaisInput, parseReaisToMinor } from './money';

// O texto vai na chave pt-BR do modelo (obrigatória) até a tradução automática da D5 existir; salvar
// apaga as traduções escritas à mão antes da F3, que deixariam de acompanhar o texto.
function toLocalized(value: string): LocalizedText {
  return { 'pt-BR': value.trim() };
}

const MINUTES_PER_HOUR = 60;

/** Converte o formulário (valores em reais digitados) no corpo da API (centavos inteiros). */
export function offerFormToFields(values: OfferFormValues): OfferFields {
  const description = toLocalized(values.description);
  const group = values.kind === 'tour' && values.sellingUnit === 'group';
  return {
    title: toLocalized(values.title),
    ...(description['pt-BR'] ? { description } : {}),
    pricing: {
      currency: 'BRL',
      priceOptions: values.priceOptions.map((option) => ({
        id: option.id,
        label: { 'pt-BR': option.label.trim() },
        unitAmountMinor: parseReaisToMinor(option.amount) ?? 0,
      })),
    },
    durationMinutes: values.durationHours * MINUTES_PER_HOUR + values.durationMins,
    ...(values.meetingPoint.trim()
      ? { meetingPoint: { address: values.meetingPoint.trim() } }
      : {}),
    // Entrada de atração é sempre no local e por pessoa; buscar o cliente e vender por grupo só no passeio (D20).
    pickupMode: values.kind === 'tour' ? values.pickupMode : 'meeting_point',
    cancellationPolicy: values.cancellationPolicy,
    maxParticipantsPerBooking: values.maxParticipantsPerBooking,
    ...(group
      ? { sellingUnit: 'group', groupMaxPeople: values.groupMaxPeople }
      : { sellingUnit: 'person' }),
    // Grupo não tem nome por pessoa: o cliente decide quem leva.
    requiresParticipantNames: !group && values.requiresParticipantNames,
  };
}

export function offerToFormValues(offer: PartnerOffer): OfferFormValues {
  const minutes = offer.durationMinutes ?? MINUTES_PER_HOUR;
  return {
    kind: offer.kind,
    title: offer.title['pt-BR'],
    description: offer.description?.['pt-BR'] ?? '',
    priceOptions: offer.pricing.priceOptions.map((option) => ({
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
  };
}

export function emptyOfferFormValues(kind: 'tour' | 'private_entry'): OfferFormValues {
  return {
    kind,
    title: '',
    description: '',
    priceOptions: [{ id: 'adult', label: '', amount: '' }],
    durationHours: 2,
    durationMins: 0,
    meetingPoint: '',
    pickupMode: 'meeting_point',
    cancellationPolicy: 'flexible',
    maxParticipantsPerBooking: 8,
    requiresParticipantNames: false,
    sellingUnit: 'person',
    groupMaxPeople: 4,
  };
}
