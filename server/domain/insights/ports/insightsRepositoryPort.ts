import { InteractionType, ItemStats } from '../types/interaction';

export interface CreateInteractionData {
  itemId: string;
  itemCollection: 'items' | 'events';
  type: InteractionType;
  userId?: string | null | undefined;
  partnerId?: string | null | undefined;
}

export interface InsightsRepositoryPort {
  recordInteraction(data: CreateInteractionData): Promise<void>;
  getItemStats(itemId: string, itemCollection: 'items' | 'events'): Promise<ItemStats>;
}
