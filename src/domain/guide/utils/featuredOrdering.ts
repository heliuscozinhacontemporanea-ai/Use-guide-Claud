import type { GuideItem } from '../types/guide';

export interface OrderedListing {
  items: GuideItem[];
  featuredIds: ReadonlySet<string>;
}

/** Espaço pago (DESIGN.md §8, D37): no máximo 1 vaga paga a cada 6 cartões e nunca duas seguidas. */
export const PAID_SLOT_SPACING = 6;

const byOrganicRank = (a: GuideItem, b: GuideItem) =>
  (b.rating ?? 0) - (a.rating ?? 0) || (b.reviewCount ?? 0) - (a.reviewCount ?? 0);

/**
 * Ordem das listas: as vagas pagas do dia (D11), na ordem do sorteio, no 1º, 7º e 13º cartão; o
 * resto em ordem orgânica (nota e avaliações), com assinantes e não assinantes juntos. Quando a lista
 * acaba antes da posição, a vaga entra na ordem normal, sem o rótulo.
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
  const ordered: GuideItem[] = [];
  const placed = new Set<string>();
  featured.forEach((paid, slot) => {
    const organicBefore = slot === 0 ? 0 : PAID_SLOT_SPACING - 1;
    // Sem 5 cartões normais entre duas vagas, a vaga seguinte não entra como paga.
    if (slot > 0 && (placed.size < slot || rest.length < organicBefore)) return;
    ordered.push(...rest.splice(0, organicBefore), paid);
    placed.add(paid.id);
  });
  ordered.push(...rest);
  // Vaga que não coube volta para a ordem normal, sem o rótulo.
  const leftovers = featured.filter((item) => !placed.has(item.id)).sort(organic);
  ordered.push(...leftovers);
  return { items: ordered, featuredIds: placed };
}
