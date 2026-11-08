import { z } from 'zod';
import { reviewReportApi } from '../../factory';
import type { ReviewReportOutcome } from '../../types/reviewReport';

const schema = z.object({
  reportId: z.string().trim().min(1),
  outcome: z.enum(['upheld', 'dismissed']),
});

export function decideReviewReportUseCase(
  reportId: string,
  outcome: ReviewReportOutcome
): Promise<void> {
  const data = schema.parse({ reportId, outcome });
  return reviewReportApi.decide(data.reportId, data.outcome);
}
