import { useMemo } from 'react';
import { featuredListKeyOf, type FeaturedListings } from '../types/featuredListing';
import type { GuideItem } from '../types/guide';
import { type OrderedListing, orderWithFeatured } from '../utils/featuredOrdering';

const SECTION_SIZE = 10;

interface ExploreSectionsInput {
  items: GuideItem[];
  events: GuideItem[];
  featured: FeaturedListings;
}

/** Itens de cada carrossel da Explorar: vagas pagas espaçadas (D11, DESIGN.md §8) e no máximo 10. */
export function useExploreSections({ items, events, featured }: ExploreSectionsInput) {
  return useMemo(() => {
    const sectionFor = (category: GuideItem['category']): OrderedListing => {
      const source = category === 'event' ? events : items;
      const listKey = featuredListKeyOf(category);
      // Eventos seguem a ordem de data do catálogo; as outras listas, nota e avaliações.
      const ordered = orderWithFeatured(
        source.filter((item) => item.category === category),
        listKey ? featured[listKey] : [],
        category === 'event' ? () => 0 : undefined
      );
      return { ...ordered, items: ordered.items.slice(0, SECTION_SIZE) };
    };
    return sectionFor;
  }, [items, events, featured]);
}
