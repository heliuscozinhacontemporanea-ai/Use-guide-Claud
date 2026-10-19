import { z } from 'zod';
import { insightsAdapter } from '../../factory';
import { ItemStats } from '../../types/interaction';

const getItemStatsSchema = z.object({
  itemId: z.string().min(1, 'ID do item é obrigatório'),
  itemCollection: z.enum(['items', 'events']).optional(),
});

export async function getItemStatsUseCase(
  itemId: string,
  itemCollection: 'items' | 'events' = 'items'
): Promise<ItemStats> {
  getItemStatsSchema.parse({ itemId, itemCollection });
  return insightsAdapter.getItemStats(itemId, itemCollection);
}
