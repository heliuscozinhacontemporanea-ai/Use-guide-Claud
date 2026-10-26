import { adminFinanceApiAdapter } from '../../factory';
import type { AdminForceMajeureReview } from '../../types/adminFinance';

export function listForceMajeureReviewsUseCase(): Promise<AdminForceMajeureReview[]> {
  return adminFinanceApiAdapter.listForceMajeureReviews();
}
