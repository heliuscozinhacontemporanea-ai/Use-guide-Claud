import { reviewAdapter } from '../../factory';
import { FirestoreReview, ReviewSortOption } from '../../types/review';

export function subscribeToReviewsUseCase(
  itemId: string,
  limitCount: number,
  sortBy: ReviewSortOption,
  onUpdate: (reviews: FirestoreReview[]) => void,
  onError?: (error: Error) => void,
  itemCollection: 'items' | 'events' = 'items'
): () => void {
  return reviewAdapter.subscribeToReviews(
    itemId,
    itemCollection,
    limitCount,
    sortBy,
    onUpdate,
    onError
  );
}
