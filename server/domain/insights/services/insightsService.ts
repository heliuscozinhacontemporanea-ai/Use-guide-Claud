import { InsightsRepositoryPort, CreateInteractionData } from '../ports/insightsRepositoryPort';
import { ItemStats } from '../types/interaction';
import { getResourceOwnerIdUseCase } from '../../guide';
import { getEventListingByIdUseCase } from '../../events';

export class InsightsService {
  constructor(private repoPort: InsightsRepositoryPort) {}

  async trackInteraction(data: CreateInteractionData): Promise<void> {
    await this.repoPort.recordInteraction(data);
  }

  async getItemStats(
    itemId: string,
    itemCollection: 'items' | 'events' = 'items',
    userContext?: { uid: string; admin?: boolean }
  ): Promise<ItemStats> {
    if (userContext && !userContext.admin) {
      let ownerId: string | null = null;
      if (itemCollection === 'events') {
        const event = await getEventListingByIdUseCase(itemId);
        ownerId = event?.ownerId ?? null;
      } else {
        ownerId = await getResourceOwnerIdUseCase('items', itemId);
      }
      if (!ownerId || ownerId !== userContext.uid) {
        throw new Error('FORBIDDEN');
      }
    }
    return this.repoPort.getItemStats(itemId, itemCollection);
  }
}
