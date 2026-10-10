import { reviewAdapter } from '../../factory';
import { FirestoreReview } from '../../types/review';

export async function getAllReviewsUseCase(): Promise<FirestoreReview[]> {
  return reviewAdapter.getAllReviews();
}
