import { listPublicEventListingsUseCase } from '../../../domain/events';
import {
  FEATURED_LISTS,
  type FeaturedList,
  type FeaturedListingsProjection,
  featuredRotationDay,
  listPublicGuideItemsUseCase,
  pickFeaturedListingIds,
  saveFeaturedListingsUseCase,
} from '../../../domain/guide';
import { listActivePlanItemIdsUseCase } from '../../../domain/partners';
import { resolveFeaturedSlotsPerList } from '../../../shared/kernel/featuredSlots';

const ACTIVE_PLANS_LIMIT = 2000;

/**
 * Rodízio diário do "Destaque" (D11): em cada lista, sorteia com semente fixa do dia as vagas
 * entre os estabelecimentos com plano em vigor; o evento concorre pelo plano do estabelecimento.
 */
export async function refreshFeaturedListingsApplicationUseCase(
  now: Date = new Date()
): Promise<{ day: string; featured: number }> {
  const slots = resolveFeaturedSlotsPerList();
  const day = featuredRotationDay(now);
  const withPlan = new Set(await listActivePlanItemIdsUseCase(ACTIVE_PLANS_LIMIT));

  const candidates = new Map<FeaturedList, string[]>(FEATURED_LISTS.map((list) => [list, []]));
  for (const item of await listPublicGuideItemsUseCase()) {
    const list = candidates.get(item.category as FeaturedList);
    if (list && withPlan.has(item.id)) list.push(item.id);
  }
  const events = candidates.get('events') ?? [];
  for (const event of await listPublicEventListingsUseCase()) {
    if (event.isActive && event.establishmentId && withPlan.has(event.establishmentId)) {
      events.push(event.id);
    }
  }

  const updatedAt = now.toISOString();
  const projections: FeaturedListingsProjection[] = FEATURED_LISTS.map((list) => ({
    list,
    listingIds: pickFeaturedListingIds(candidates.get(list) ?? [], `${day}:${list}`, slots),
    day,
    updatedAt,
  }));
  await saveFeaturedListingsUseCase(projections);
  return {
    day,
    featured: projections.reduce((total, projection) => total + projection.listingIds.length, 0),
  };
}
