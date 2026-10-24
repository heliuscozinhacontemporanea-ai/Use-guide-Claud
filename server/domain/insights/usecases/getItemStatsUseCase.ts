import { insightsService } from '../factory';
import type { ItemStats } from '../types/interaction';

/** Métricas de um item ou evento; só o dono ou o admin (lança `InsightsAccessError`). */
export function getItemStatsUseCase(
  itemId: string,
  itemCollection: 'items' | 'events',
  userContext: { uid: string; admin?: boolean }
): Promise<ItemStats> {
  return insightsService.getItemStats(itemId, itemCollection, userContext);
}
