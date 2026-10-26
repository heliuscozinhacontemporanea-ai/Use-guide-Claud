import type { PartnerOffer } from '../types/bookings';

// Fase 1 (decisão D3): passeio vende horários; atração vende entradas.
const KIND_BY_CATEGORY: Record<string, PartnerOffer['kind']> = {
  tour: 'tour',
  sight: 'private_entry',
};

export function offerKindForCategory(category: string): PartnerOffer['kind'] | undefined {
  return KIND_BY_CATEGORY[category];
}

/** Só passeios e atrações vendem reservas na fase 1. */
export function isBookableCategory(category: string): boolean {
  return offerKindForCategory(category) !== undefined;
}
