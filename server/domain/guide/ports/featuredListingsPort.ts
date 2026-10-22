import type { FeaturedListingsProjection } from '../types/featuredListing';

export interface FeaturedListingsPort {
  /** Substitui as projeções públicas de todas as listas de uma vez. */
  replaceAll(projections: FeaturedListingsProjection[]): Promise<void>;
}
