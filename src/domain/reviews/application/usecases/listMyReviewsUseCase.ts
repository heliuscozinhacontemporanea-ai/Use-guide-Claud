import { z } from 'zod';
import type { DatabaseCursor, DatabasePage } from '../../../database/ports/databasePort';
import { reviewAdapter } from '../../factory';
import type { FirestoreReview } from '../../types/review';

const MAX_PAGE_SIZE = 50;
const schema = z.object({
  userId: z.string().trim().min(1),
  limit: z.number().int().min(1).max(MAX_PAGE_SIZE),
});

/** Avaliações da própria pessoa, mais novas primeiro, paginadas por cursor (AGENTS.md §6.4). */
export function listMyReviewsUseCase(
  userId: string,
  limit: number,
  cursor?: DatabaseCursor | null
): Promise<DatabasePage<FirestoreReview>> {
  const data = schema.parse({ userId, limit });
  return reviewAdapter.listUserReviews(data.userId, data.limit, cursor);
}
