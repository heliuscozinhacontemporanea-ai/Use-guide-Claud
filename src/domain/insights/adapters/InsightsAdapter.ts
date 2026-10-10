import { InsightsPort } from '../ports/insightsPort';
import { InteractionType, ItemStats } from '../types/interaction';
import { firebaseApiFetch } from '../../../shared/infrastructure/firebase/firebaseApiFetch';

export class InsightsAdapter implements InsightsPort {
  async trackInteraction(
    itemId: string,
    type: InteractionType,
    collectionName: 'items' | 'events',
    _partnerId?: string,
    _userId?: string | null
  ): Promise<void> {
    try {
      await firebaseApiFetch(
        '/api/insights/track',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            itemId,
            itemCollection: collectionName,
            type,
          }),
        },
        { requireAuth: true }
      );
    } catch (error) {
      console.error('[InsightsAdapter.trackInteraction Error]:', error);
    }
  }

  async getItemStats(
    itemId: string,
    itemCollection: 'items' | 'events' = 'items'
  ): Promise<ItemStats | null> {
    try {
      const res = await firebaseApiFetch(`/api/insights/stats/${itemCollection}/${itemId}`);
      if (res.ok) {
        const json = await res.json();
        return json.data || null;
      }
      return null;
    } catch (error) {
      console.error('[InsightsAdapter.getItemStats Error]:', error);
      return null;
    }
  }
}
