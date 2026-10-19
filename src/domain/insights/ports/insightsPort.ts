import { InteractionType, ItemStats } from '../types/interaction';

export interface InsightsPort {
  trackInteraction(
    itemId: string,
    type: InteractionType,
    collectionName: 'items' | 'events',
    partnerId?: string,
    userId?: string | null
  ): Promise<void>;

  getItemStats(itemId: string, itemCollection?: 'items' | 'events'): Promise<ItemStats>;
}
