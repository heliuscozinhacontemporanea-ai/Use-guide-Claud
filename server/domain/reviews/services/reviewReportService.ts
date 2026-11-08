import { ReviewReportError } from '../errors/reviewReportError';
import type { ReviewReportRepositoryPort } from '../ports/reviewReportPort';
import type {
  MyReviewReport,
  ReviewReport,
  ReviewReportOutcome,
  ReviewReportReason,
} from '../types/reviewReport';
import { buildReviewReportId } from '../utils/reviewReportId';

const DAY_MS = 86_400_000;
/** Prazo de análise mostrado ao autor (D19). */
export const REVIEW_REPORT_DECISION_DAYS = 3;
/** Limite de denúncias por pessoa em 24 h, contado no Firestore (o Cloud Run não guarda estado). */
export const REVIEW_REPORTS_PER_DAY = 5;

export interface ReportReviewResponseInput {
  reviewId: string;
  reason: ReviewReportReason;
  details?: string;
}

/** Denúncia da resposta do estabelecimento pelo autor da avaliação e decisão do admin (D19). */
export class ReviewReportService {
  constructor(
    private readonly repository: ReviewReportRepositoryPort,
    private readonly now: () => Date = () => new Date()
  ) {}

  async report(reporterUid: string, input: ReportReviewResponseInput): Promise<MyReviewReport> {
    const review = await this.repository.getReview(input.reviewId);
    if (!review) throw new ReviewReportError('NOT_FOUND', 'Avaliação não encontrada.');
    // Só o autor denuncia por aqui (Minhas avaliações); a página pública não tem esse botão.
    if (review.userId !== reporterUid) {
      throw new ReviewReportError(
        'FORBIDDEN',
        'Só o autor da avaliação pode denunciar a resposta.'
      );
    }
    const responseText = review.partnerResponse?.trim();
    if (!responseText) {
      throw new ReviewReportError('NO_RESPONSE_TO_REPORT', 'Esta avaliação não tem resposta.');
    }
    const now = this.now();
    const recent = await this.repository.countByReporterSince(
      reporterUid,
      new Date(now.getTime() - DAY_MS).toISOString()
    );
    if (recent >= REVIEW_REPORTS_PER_DAY) {
      throw new ReviewReportError('REPORT_LIMIT_REACHED', 'Limite de denúncias por dia atingido.');
    }
    const details = input.details?.trim();
    const report: ReviewReport = {
      id: buildReviewReportId(review.id, responseText),
      reviewId: review.id,
      reporterUid,
      reason: input.reason,
      ...(details ? { details: details.slice(0, 500) } : {}),
      status: 'open',
      responseText,
      responderId: review.responderId,
      reviewRating: review.rating,
      reviewComment: review.comment,
      itemId: review.itemId,
      itemCollection: review.itemCollection,
      placeName: await this.repository.placeNameOf(review.itemId, review.itemCollection),
      createdAt: now.toISOString(),
      decideBy: new Date(now.getTime() + REVIEW_REPORT_DECISION_DAYS * DAY_MS).toISOString(),
    };
    const saved = await this.repository.createIfAbsent(report);
    if (!saved.created) {
      throw new ReviewReportError('ALREADY_REPORTED', 'Você já denunciou esta resposta.');
    }
    return toMine(saved.report);
  }

  async listMine(reporterUid: string): Promise<MyReviewReport[]> {
    return (await this.repository.listByReporter(reporterUid, 100)).map(toMine);
  }

  listOpen(limit: number, cursor?: string): Promise<ReviewReport[]> {
    return this.repository.listOpen(limit, cursor);
  }

  async decide(
    adminUid: string,
    reportId: string,
    outcome: ReviewReportOutcome
  ): Promise<ReviewReport> {
    const decided = await this.repository.decide(
      reportId,
      (current) => {
        if (current.status !== 'open') {
          throw new ReviewReportError('ALREADY_DECIDED', 'Esta denúncia já foi decidida.');
        }
        return {
          ...current,
          status: outcome,
          decidedAt: this.now().toISOString(),
          decidedBy: adminUid,
        };
      },
      outcome === 'upheld'
    );
    if (!decided) throw new ReviewReportError('NOT_FOUND', 'Denúncia não encontrada.');
    return decided;
  }

  deleteByReporter(reporterUid: string): Promise<void> {
    return this.repository.deleteByReporter(reporterUid);
  }
}

function toMine(report: ReviewReport): MyReviewReport {
  return {
    id: report.id,
    reviewId: report.reviewId,
    status: report.status,
    createdAt: report.createdAt,
    decideBy: report.decideBy,
  };
}
