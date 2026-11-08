/** Motivos fechados da denúncia de resposta (D19). */
export const REVIEW_REPORT_REASONS = ['offensive', 'fraud', 'personal_data', 'other'] as const;
export type ReviewReportReason = (typeof REVIEW_REPORT_REASONS)[number];

export type ReviewReportStatus = 'open' | 'upheld' | 'dismissed';
export type ReviewReportOutcome = 'upheld' | 'dismissed';

/**
 * Denúncia da resposta de um estabelecimento, feita pelo autor da avaliação. Coleção só de backend:
 * `reporterUid` e `details` não saem para o estabelecimento (D19).
 */
export interface ReviewReport {
  id: string;
  reviewId: string;
  reporterUid: string;
  reason: ReviewReportReason;
  details?: string;
  status: ReviewReportStatus;
  /** Cópia do que foi denunciado, para o admin decidir mesmo se a resposta mudar. */
  responseText: string;
  responderId: string | null;
  reviewRating: number;
  reviewComment: string;
  itemId: string;
  itemCollection: 'items' | 'events';
  placeName: string | null;
  createdAt: string;
  decideBy: string;
  decidedAt?: string;
  decidedBy?: string;
  /** Aceita: a resposta saiu da avaliação (só quando ainda era a mesma denunciada). */
  responseRemoved?: boolean;
}

/** O que o autor vê no próprio cartão: sem dados de quem decidiu. */
export interface MyReviewReport {
  id: string;
  reviewId: string;
  status: ReviewReportStatus;
  createdAt: string;
  decideBy: string;
}

export interface ReviewForReport {
  id: string;
  userId: string;
  itemId: string;
  itemCollection: 'items' | 'events';
  rating: number;
  comment: string;
  partnerResponse: string | null;
  responderId: string | null;
}
