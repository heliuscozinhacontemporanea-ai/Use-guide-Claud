import { z } from 'zod';
import { REVIEW_REPORT_REASONS } from '../types/reviewReport';

const ID = z
  .string()
  .min(1)
  .max(300)
  .regex(/^[\w-]+$/);

export const ReportReviewResponseSchema = z
  .object({
    reviewId: ID,
    reason: z.enum(REVIEW_REPORT_REASONS),
    details: z.string().trim().max(500).optional(),
  })
  .strict();

export const ReviewReportParamsSchema = z.object({ reportId: ID }).strict();

export const ListReviewReportsQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(100).default(50),
    cursor: ID.optional(),
  })
  .strict();

export const DecideReviewReportSchema = z
  .object({ outcome: z.enum(['upheld', 'dismissed']) })
  .strict();
