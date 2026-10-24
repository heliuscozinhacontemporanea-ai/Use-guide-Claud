import type { GuideItem } from './guide';

/** Projeção pública `featuredListings/{lista}` gravada pelo job diário do backend (D11). */
export type FeaturedListings = Partial<Record<FeaturedListKey, string[]>>;

export type FeaturedListKey =
  | 'hotel'
  | 'restaurant'
  | 'tour'
  | 'sight'
  | 'transfer'
  | 'rental'
  | 'events';

const LIST_BY_CATEGORY: Partial<Record<GuideItem['category'], FeaturedListKey>> = {
  hotel: 'hotel',
  restaurant: 'restaurant',
  tour: 'tour',
  sight: 'sight',
  transfer: 'transfer',
  rental: 'rental',
  event: 'events',
};

/** Lista do destaque da categoria; dicas e perfis de produtor não têm vagas. */
export function featuredListKeyOf(category: GuideItem['category']): FeaturedListKey | null {
  return LIST_BY_CATEGORY[category] ?? null;
}
