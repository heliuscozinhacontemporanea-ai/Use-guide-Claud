import type {
  ModerationPage,
  MyReviewReport,
  ReviewReportOutcome,
  ReviewReportReason,
} from '../types/reviewReport';

export interface ReviewReportApiPort {
  report(input: {
    reviewId: string;
    reason: ReviewReportReason;
    details?: string;
  }): Promise<MyReviewReport>;
  listMine(): Promise<MyReviewReport[]>;
  listOpen(cursor?: string | null): Promise<ModerationPage>;
  decide(reportId: string, outcome: ReviewReportOutcome): Promise<void>;
}
