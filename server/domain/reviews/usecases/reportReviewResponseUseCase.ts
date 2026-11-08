import { reviewReportService } from '../factory';
import type { ReportReviewResponseInput } from '../services/reviewReportService';
import type { MyReviewReport } from '../types/reviewReport';

/** O autor da avaliação denuncia a resposta do estabelecimento (D19). */
export function reportReviewResponseUseCase(
  reporterUid: string,
  input: ReportReviewResponseInput
): Promise<MyReviewReport> {
  return reviewReportService.report(reporterUid, input);
}
