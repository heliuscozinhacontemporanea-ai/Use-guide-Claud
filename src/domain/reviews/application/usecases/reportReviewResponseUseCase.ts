import { z } from 'zod';
import { reviewReportApi } from '../../factory';
import { type MyReviewReport, REVIEW_REPORT_REASONS } from '../../types/reviewReport';

const schema = z
  .object({
    reviewId: z.string().trim().min(1),
    reason: z.enum(REVIEW_REPORT_REASONS),
    details: z.string().trim().max(500).optional(),
  })
  .strict();

/** Denuncia a resposta do estabelecimento; quem decide é o admin (D19). */
export function reportReviewResponseUseCase(input: {
  reviewId: string;
  reason: string;
  details?: string;
}): Promise<MyReviewReport> {
  const data = schema.parse(input);
  return reviewReportApi.report({ ...data, details: data.details || undefined });
}
