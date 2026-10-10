import { z } from 'zod';
import { reviewAdapter } from '../../factory';
import { DatabaseCursor, DatabasePage } from '../../../database/ports/databasePort';
import { FirestoreReview, ReviewSortOption } from '../../types/review';

const getReviewsSchema = z.object({
  itemId: z.string().trim().min(1, 'ID do item é obrigatório'),
  itemCollection: z.enum(['items', 'events']).default('items'),
  limitCount: z.number().int().min(1).max(50),
  sortBy: z.enum(['recent', 'highest', 'lowest']),
});

export async function getReviewsUseCase(
  itemId: string,
  limitCount = 10,
  sortBy: ReviewSortOption = 'recent',
  cursor?: DatabaseCursor | null,
  itemCollection: 'items' | 'events' = 'items'
): Promise<DatabasePage<FirestoreReview>> {
  const data = getReviewsSchema.parse({
    itemId,
    itemCollection,
    limitCount,
    sortBy,
  });
  return reviewAdapter.getReviews(
    data.itemId,
    data.itemCollection,
    data.limitCount,
    data.sortBy,
    cursor
  );
}
