/** Listas com vagas de "Destaque" (D11): as categorias de estabelecimento do guia e os eventos. */
export const FEATURED_LISTS = [
  'hotel',
  'restaurant',
  'tour',
  'sight',
  'transfer',
  'rental',
  'events',
] as const;

export type FeaturedList = (typeof FEATURED_LISTS)[number];

/** Projeção pública `featuredListings/{list}`, igual para todos os visitantes no dia. */
export interface FeaturedListingsProjection {
  list: FeaturedList;
  listingIds: string[];
  /** Dia do rodízio no fuso do negócio (YYYY-MM-DD). */
  day: string;
  updatedAt: string;
}
