import { reviewReportService } from '../factory';
import type { MyReviewReport } from '../types/reviewReport';

export function listMyReviewReportsUseCase(reporterUid: string): Promise<MyReviewReport[]> {
  return reviewReportService.listMine(reporterUid);
}
