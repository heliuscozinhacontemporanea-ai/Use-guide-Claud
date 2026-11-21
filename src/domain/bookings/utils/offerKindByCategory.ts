import type { PartnerOffer } from '../types/bookings';

// Passeio vende horários; atração, entradas; aluguel e translado, por veículo (D3; F3 da D34).
const KIND_BY_CATEGORY: Record<string, PartnerOffer['kind']> = {
  tour: 'tour',
  sight: 'private_entry',
  rental: 'rental',
  transfer: 'transfer',
};

export function offerKindForCategory(category: string): PartnerOffer['kind'] | undefined {
  return KIND_BY_CATEGORY[category];
}

/** Categorias do guia que vendem reservas pelo app. */
export function isBookableCategory(category: string): boolean {
  return offerKindForCategory(category) !== undefined;
}

/** Venda por veículo em dias abertos: aluguel e translado privativo (F3b). */
export function isFleetOffer(offer: Pick<PartnerOffer, 'kind' | 'sellingUnit'>): boolean {
  return offer.kind === 'rental' || (offer.kind === 'transfer' && offer.sellingUnit === 'group');
}
