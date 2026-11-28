import type { RouteKey } from '../../../shared/i18n';
import type { FeaturedListings } from '../types/featuredListing';
import { featuredListKeyOf } from '../types/featuredListing';
import type { GuideItem } from '../types/guide';
import { type OrderedListing, orderWithFeatured } from './featuredOrdering';

type ListingCategory = GuideItem['category'];

/** Categorias de cada página das abas Experiências e Serviços (D37 item 7). */
export const ROUTE_CATEGORIES: Partial<Record<RouteKey, readonly ListingCategory[]>> = {
  experiences: ['tour', 'event', 'sight'],
  tours: ['tour'],
  events: ['event'],
  attractions: ['sight'],
  services: ['hotel', 'restaurant', 'transfer', 'rental'],
  stays: ['hotel'],
  restaurants: ['restaurant'],
  transfers: ['transfer'],
  rentals: ['rental'],
};

/** Lista de uma categoria (D11): vagas pagas do dia no topo; eventos por data, o resto por nota. */
function orderCategory(
  category: ListingCategory,
  items: GuideItem[],
  events: GuideItem[],
  featured: FeaturedListings,
  withFeatured: boolean
): OrderedListing {
  const raw = category === 'event' ? events : items.filter((item) => item.category === category);
  const listKey = featuredListKeyOf(category);
  return orderWithFeatured(
    raw,
    withFeatured && listKey ? (featured[listKey] ?? []) : [],
    category === 'event' ? () => 0 : undefined
  );
}

/**
 * Ordem da página: uma categoria segue a D11. Várias categorias juntas ("Todas", "Todos") alternam as
 * categorias, cada uma na sua ordem normal, sem vagas pagas no topo até a decisão das vagas do plano
 * nessas telas (D37 item 16).
 */
export function orderTabListing(
  routeKey: RouteKey,
  items: GuideItem[],
  events: GuideItem[],
  featured: FeaturedListings
): OrderedListing {
  const categories = ROUTE_CATEGORIES[routeKey] ?? [];
  const [only] = categories;
  if (only && categories.length === 1) {
    return orderCategory(only, items, events, featured, true);
  }
  const lists = categories.map((category) =>
    orderCategory(category, items, events, featured, false)
  );
  const merged: GuideItem[] = [];
  const longest = Math.max(0, ...lists.map((list) => list.items.length));
  for (let index = 0; index < longest; index += 1) {
    for (const list of lists) {
      const item = list.items[index];
      if (item) merged.push(item);
    }
  }
  return { items: merged, featuredIds: new Set() };
}
