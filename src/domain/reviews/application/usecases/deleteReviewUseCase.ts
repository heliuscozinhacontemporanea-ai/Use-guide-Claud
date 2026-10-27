import { z } from 'zod';
import { reviewAdapter } from '../../factory';

const schema = z.string().trim().min(1);

/** Exclui a avaliação pelo backend, que confere se ela é da pessoa e recalcula a nota do lugar. */
export function deleteReviewUseCase(reviewId: string): Promise<void> {
  return reviewAdapter.deleteReview(schema.parse(reviewId));
}
