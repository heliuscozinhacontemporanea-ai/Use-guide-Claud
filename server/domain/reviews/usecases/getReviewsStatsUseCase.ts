import { reviewService } from '../factory';

export async function getReviewsStatsUseCase(): Promise<{
  totalReviews: number;
  avgRating: number;
}> {
  return reviewService.getReviewsStats();
}
