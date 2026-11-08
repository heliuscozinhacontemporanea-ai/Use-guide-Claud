/** Espelho dos tipos de denúncia do backend (D19). */
export const REVIEW_REPORT_REASONS = ['offensive', 'fraud', 'personal_data', 'other'] as const;
export type ReviewReportReason = (typeof REVIEW_REPORT_REASONS)[number];
export type ReviewReportStatus = 'open' | 'upheld' | 'dismissed';
export type ReviewReportOutcome = 'upheld' | 'dismissed';

export interface MyReviewReport {
  id: string;
  reviewId: string;
  status: ReviewReportStatus;
  createdAt: string;
  decideBy: string;
}

/** Linha da fila de Moderação: sem quem denunciou (o backend não envia). */
export interface ModerationReviewReport {
  id: string;
  reviewId: string;
  reason: ReviewReportReason;
  details?: string;
  status: ReviewReportStatus;
  responseText: string;
  reviewRating: number;
  reviewComment: string;
  itemId: string;
  itemCollection: 'items' | 'events';
  placeName: string | null;
  createdAt: string;
  decideBy: string;
}

export interface ModerationPage {
  data: ModerationReviewReport[];
  nextCursor: string | null;
}
