import { z } from 'zod';
import { reviewAdapter } from '../../factory';

const schema = z.object({
  itemId: z.string().trim().min(1),
  userId: z.string().trim().min(1),
  itemCollection: z.enum(['items', 'events']).default('items'),
  occurrenceId: z.string().trim().min(1).optional(),
});

export async function getUserReviewUseCase(
  itemId: string,
  userId: string,
  itemCollection: 'items' | 'events' = 'items',
  occurrenceId?: string
) {
  const data = schema.parse({
    itemId,
    userId,
    itemCollection,
    ...(occurrenceId ? { occurrenceId } : {}),
  });
  if (data.occurrenceId) {
    return reviewAdapter.getUserReview(
      data.itemId,
      data.itemCollection,
      data.userId,
      data.occurrenceId
    );
  }
  return reviewAdapter.getUserReview(data.itemId, data.itemCollection, data.userId);
}
