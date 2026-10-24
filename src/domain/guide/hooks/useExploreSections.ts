import { useMemo } from 'react';
import { filterItemsList } from '../../search';
import { featuredListKeyOf, type FeaturedListings } from '../types/featuredListing';
import type { GuideItem } from '../types/guide';
import { type OrderedListing, orderWithFeatured } from '../utils/featuredOrdering';

const SECTION_SIZE = 10;

interface ExploreSectionsInput {
  items: GuideItem[];
  events: GuideItem[];
  featured: FeaturedListings;
  searchQuery: string;
  appliedRegions: string[];
  appliedCategories: string[];
}

/** Itens de cada carrossel da home: filtro, vagas "Destaque" no topo e no máximo 10 (D11). */
export function useExploreSections({
  items,
  events,
  featured,
  searchQuery,
  appliedRegions,
  appliedCategories,
}: ExploreSectionsInput) {
  return useMemo(() => {
    const sectionFor = (category: GuideItem['category']): OrderedListing => {
      if (appliedCategories.length > 0 && !appliedCategories.includes(category)) {
        return { items: [], featuredIds: new Set() };
      }
      const source = category === 'event' ? events : items;
      const filtered = filterItemsList(source, searchQuery, appliedRegions).filter(
        (item) => item.category === category
      );
      const listKey = featuredListKeyOf(category);
      // Eventos seguem a ordem de data do catálogo; as outras listas, nota e avaliações.
      const ordered = orderWithFeatured(
        filtered,
        listKey ? featured[listKey] : [],
        category === 'event' ? () => 0 : undefined
      );
      return { ...ordered, items: ordered.items.slice(0, SECTION_SIZE) };
    };
    return sectionFor;
  }, [items, events, featured, searchQuery, appliedRegions, appliedCategories]);
}
