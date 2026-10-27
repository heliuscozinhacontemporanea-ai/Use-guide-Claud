import type { ReviewForReport, ReviewReport } from '../types/reviewReport';

export interface ReviewReportRepositoryPort {
  getReview(reviewId: string): Promise<ReviewForReport | null>;
  placeNameOf(itemId: string, itemCollection: 'items' | 'events'): Promise<string | null>;
  countByReporterSince(reporterUid: string, sinceIso: string): Promise<number>;
  /** Grava se ainda não existe; devolve o que ficou gravado e se foi agora. */
  createIfAbsent(report: ReviewReport): Promise<{ report: ReviewReport; created: boolean }>;
  listByReporter(reporterUid: string, limit: number): Promise<ReviewReport[]>;
  listOpen(limit: number, cursor?: string): Promise<ReviewReport[]>;
  /**
   * Aplica a decisão numa transação: `change` devolve o novo estado (ou lança); com `removeResponse`,
   * a resposta sai da avaliação se ainda for o texto denunciado.
   */
  decide(
    id: string,
    change: (current: ReviewReport) => ReviewReport,
    removeResponse: boolean
  ): Promise<ReviewReport | null>;
  deleteByReporter(reporterUid: string): Promise<void>;
}
