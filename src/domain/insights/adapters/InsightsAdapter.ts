import { InsightsPort } from '../ports/insightsPort';
import { InteractionType, ItemStats } from '../types/interaction';
import { firebaseApiFetch } from '../../../shared/infrastructure/firebase/firebaseApiFetch';

export class InsightsAdapter implements InsightsPort {
  async trackInteraction(
    itemId: string,
    type: InteractionType,
    collectionName: 'items' | 'events'
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
        { optionalAuth: true }
      );
    } catch (error) {
      console.error('[InsightsAdapter.trackInteraction Error]:', error);
    }
  }

  async getItemStats(
    itemId: string,
    itemCollection: 'items' | 'events' = 'items'
  ): Promise<ItemStats> {
    const res = await firebaseApiFetch(
      `/api/insights/stats/${itemCollection}/${encodeURIComponent(itemId)}`,
      {},
      { requireAuth: true }
    );
    if (!res.ok) {
      // Lança o `code` estável (AGENTS.md §10.2): LISTING_PLAN_REQUIRED vira o aviso de plano (D11).
      const body = await res.json().catch(() => ({}));
      throw new Error(typeof body?.error?.code === 'string' ? body.error.code : 'INTERNAL_ERROR');
    }
    const json = (await res.json()) as { data: ItemStats };
    return json.data;
  }
}
