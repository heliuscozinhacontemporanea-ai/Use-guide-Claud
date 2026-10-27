import { reviewReportApi } from '../../factory';
import type { MyReviewReport } from '../../types/reviewReport';

export function listMyReviewReportsUseCase(): Promise<MyReviewReport[]> {
  return reviewReportApi.listMine();
}
