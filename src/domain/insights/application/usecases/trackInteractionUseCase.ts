import { z } from 'zod';
import { insightsAdapter } from '../../factory';
import { InteractionType } from '../../types/interaction';
import { getCurrentAuthUserUseCase } from '../../../auth';

const trackInteractionSchema = z.object({
  itemId: z.string().min(1, 'ID do item é obrigatório'),
  type: z.enum(['view', 'whatsapp_click', 'share', 'favorite']),
  collectionName: z.enum(['items', 'events']),
  partnerId: z.string().optional(),
});

export async function trackInteractionUseCase(
  itemId: string,
  type: InteractionType,
  collectionName: 'items' | 'events',
  partnerId?: string
): Promise<void> {
  trackInteractionSchema.parse({ itemId, type, collectionName, partnerId });
  const currentUser = getCurrentAuthUserUseCase();
  const userId = currentUser?.uid || null;
  return insightsAdapter.trackInteraction(itemId, type, collectionName, partnerId, userId);
}
