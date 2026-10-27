import { reviewReportService } from '../factory';
import type { ReviewReport, ReviewReportOutcome } from '../types/reviewReport';

/** Aceita remove a resposta denunciada; recusada mantém (D19). */
export function decideReviewReportUseCase(
  adminUid: string,
  reportId: string,
  outcome: ReviewReportOutcome
): Promise<ReviewReport> {
  return reviewReportService.decide(adminUid, reportId, outcome);
}
