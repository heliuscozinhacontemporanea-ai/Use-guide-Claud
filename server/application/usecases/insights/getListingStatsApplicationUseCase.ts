import { getEventListingByIdUseCase } from '../../../domain/events';
import { getItemStatsUseCase, type ItemStats } from '../../../domain/insights';
import { assertListingPlanActiveUseCase, ListingPlanError } from '../../../domain/partners';

export interface ListingStatsActor {
  uid: string;
  admin?: boolean;
}

/**
 * Métricas do item ou do evento para o dono, exigindo o plano do estabelecimento em vigor (D11).
 * O evento usa o plano do estabelecimento a que pertence; sem estabelecimento, não há métricas.
 */
export async function getListingStatsApplicationUseCase(
  actor: ListingStatsActor,
  itemId: string,
  itemCollection: 'items' | 'events'
): Promise<ItemStats> {
  // A posse é checada primeiro para não revelar se o item de outra pessoa tem plano.
  const stats = await getItemStatsUseCase(itemId, itemCollection, actor);
  if (actor.admin) return stats;
  const establishmentId =
    itemCollection === 'items'
      ? itemId
      : ((await getEventListingByIdUseCase(itemId))?.establishmentId ?? null);
  if (!establishmentId) {
    throw new ListingPlanError(
      'LISTING_PLAN_REQUIRED',
      'As métricas do evento fazem parte do plano do estabelecimento.'
    );
  }
  await assertListingPlanActiveUseCase(establishmentId);
  return stats;
}
