import { reviewNotificationAdapter, reviewReportService } from '../factory';
import type { ReviewReport, ReviewReportOutcome } from '../types/reviewReport';

/** Aceita remove a resposta denunciada; recusada mantém (D19). Quem denunciou é avisado (D25). */
export async function decideReviewReportUseCase(
  adminUid: string,
  reportId: string,
  outcome: ReviewReportOutcome
): Promise<ReviewReport> {
  const decided = await reviewReportService.decide(adminUid, reportId, outcome);
  await reviewNotificationAdapter
    .notifyReportDecided({ reporterUid: decided.reporterUid, reportId: decided.id })
    .catch(() => undefined);
  return decided;
}
