import { reviewReportService } from '../factory';
import type { ReviewReport } from '../types/reviewReport';

/** Fila de Moderação do admin: denúncias abertas, as mais antigas primeiro. */
export function listOpenReviewReportsUseCase(
  limit: number,
  cursor?: string
): Promise<ReviewReport[]> {
  return reviewReportService.listOpen(limit, cursor);
}
