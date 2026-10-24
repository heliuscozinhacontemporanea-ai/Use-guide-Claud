import type { GuideItem } from '../types/guide';

export interface OrderedListing {
  items: GuideItem[];
  featuredIds: ReadonlySet<string>;
}

const byOrganicRank = (a: GuideItem, b: GuideItem) =>
  (b.rating ?? 0) - (a.rating ?? 0) || (b.reviewCount ?? 0) - (a.reviewCount ?? 0);

/**
 * Ordem das listas (D11): as vagas "Destaque" do dia no topo, na ordem do sorteio; o resto em
 * ordem orgânica (nota e avaliações), com assinantes e não assinantes juntos.
 */
export function orderWithFeatured(
  items: GuideItem[],
  featuredIds: readonly string[] = [],
  organic: (a: GuideItem, b: GuideItem) => number = byOrganicRank
): OrderedListing {
  const byId = new Map(items.map((item) => [item.id, item]));
  const featured = featuredIds.flatMap((id) => {
    const item = byId.get(id);
    return item ? [item] : [];
  });
  const featuredSet = new Set(featured.map((item) => item.id));
  const rest = items.filter((item) => !featuredSet.has(item.id)).sort(organic);
  return { items: [...featured, ...rest], featuredIds: featuredSet };
}
