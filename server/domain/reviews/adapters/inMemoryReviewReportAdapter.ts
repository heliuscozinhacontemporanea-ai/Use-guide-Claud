import type { ReviewReportRepositoryPort } from '../ports/reviewReportPort';
import type { ReviewForReport, ReviewReport } from '../types/reviewReport';

/** Só para testes: o mesmo contrato do adapter do Firestore, em memória. */
export class InMemoryReviewReportAdapter implements ReviewReportRepositoryPort {
  readonly reviews = new Map<string, ReviewForReport>();
  readonly reports = new Map<string, ReviewReport>();

  async getReview(reviewId: string) {
    return this.reviews.get(reviewId) ?? null;
  }

  async placeNameOf() {
    return 'Restaurante Tamarindo';
  }

  async countByReporterSince(reporterUid: string, sinceIso: string) {
    return [...this.reports.values()].filter(
      (report) => report.reporterUid === reporterUid && report.createdAt >= sinceIso
    ).length;
  }

  async createIfAbsent(report: ReviewReport) {
    const existing = this.reports.get(report.id);
    if (existing) return { report: existing, created: false };
    this.reports.set(report.id, report);
    return { report, created: true };
  }

  async listByReporter(reporterUid: string, limit: number) {
    return [...this.reports.values()]
      .filter((report) => report.reporterUid === reporterUid)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  }

  async listOpen(limit: number) {
    return [...this.reports.values()]
      .filter((report) => report.status === 'open')
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .slice(0, limit);
  }

  async decide(
    id: string,
    change: (current: ReviewReport) => ReviewReport,
    removeResponse: boolean
  ) {
    const current = this.reports.get(id);
    if (!current) return null;
    const next = change(current);
    const review = this.reviews.get(current.reviewId);
    const sameResponse = removeResponse && review?.partnerResponse?.trim() === current.responseText;
    if (sameResponse && review) {
      this.reviews.set(review.id, { ...review, partnerResponse: null, responderId: null });
    }
    const saved = removeResponse ? { ...next, responseRemoved: sameResponse } : next;
    this.reports.set(id, saved);
    return saved;
  }

  async deleteByReporter(reporterUid: string) {
    for (const [id, report] of this.reports) {
      if (report.reporterUid === reporterUid) this.reports.delete(id);
    }
  }
}
