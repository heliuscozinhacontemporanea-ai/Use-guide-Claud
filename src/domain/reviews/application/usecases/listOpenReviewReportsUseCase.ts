import { reviewReportApi } from '../../factory';
import type { ModerationPage } from '../../types/reviewReport';

/** Fila de Moderação do admin, paginada por cursor. */
export function listOpenReviewReportsUseCase(cursor?: string | null): Promise<ModerationPage> {
  return reviewReportApi.listOpen(cursor);
}
