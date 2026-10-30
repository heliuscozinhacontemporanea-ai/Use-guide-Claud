import type { OfferFormValues } from '../schemas/offerFormSchema';
import type { LocalizedText, OfferFields, PartnerOffer } from '../types/bookings';
import { minorToReaisInput, parseReaisToMinor } from './money';

function toLocalized(value: { 'pt-BR': string; en: string; fr: string }): LocalizedText {
  return {
    'pt-BR': value['pt-BR'].trim(),
    ...(value.en.trim() ? { en: value.en.trim() } : {}),
    ...(value.fr.trim() ? { fr: value.fr.trim() } : {}),
  };
}

/** Converte o formulário (valores em reais digitados) no corpo da API (centavos inteiros). */
export function offerFormToFields(values: OfferFormValues): OfferFields {
  const description = toLocalized(values.description);
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
    durationMinutes: values.durationMinutes,
    ...(values.meetingPoint.trim()
      ? { meetingPoint: { address: values.meetingPoint.trim() } }
      : {}),
    // Entrada de atração é sempre no local; buscar o comprador só vale para passeio (D20).
    pickupMode: values.kind === 'tour' ? values.pickupMode : 'meeting_point',
    cancellationPolicy: values.cancellationPolicy,
    maxParticipantsPerBooking: values.maxParticipantsPerBooking,
    requiresParticipantNames: values.requiresParticipantNames,
  };
}

export function offerToFormValues(offer: PartnerOffer): OfferFormValues {
  return {
    kind: offer.kind,
    title: { 'pt-BR': offer.title['pt-BR'], en: offer.title.en ?? '', fr: offer.title.fr ?? '' },
    description: {
      'pt-BR': offer.description?.['pt-BR'] ?? '',
      en: offer.description?.en ?? '',
      fr: offer.description?.fr ?? '',
    },
    priceOptions: offer.pricing.priceOptions.map((option) => ({
      id: option.id,
      label: option.label['pt-BR'],
      amount: minorToReaisInput(option.unitAmountMinor),
    })),
    durationMinutes: offer.durationMinutes ?? 60,
    meetingPoint: offer.meetingPoint?.address ?? '',
    pickupMode: offer.pickupMode ?? 'meeting_point',
    cancellationPolicy: offer.cancellationPolicy,
    maxParticipantsPerBooking: offer.maxParticipantsPerBooking,
    requiresParticipantNames: offer.requiresParticipantNames,
  };
}

export function emptyOfferFormValues(kind: 'tour' | 'private_entry'): OfferFormValues {
  return {
    kind,
    title: { 'pt-BR': '', en: '', fr: '' },
    description: { 'pt-BR': '', en: '', fr: '' },
    priceOptions: [{ id: 'adult', label: '', amount: '' }],
    durationMinutes: 120,
    meetingPoint: '',
    pickupMode: 'meeting_point',
    cancellationPolicy: 'flexible',
    maxParticipantsPerBooking: 8,
    requiresParticipantNames: false,
  };
}
