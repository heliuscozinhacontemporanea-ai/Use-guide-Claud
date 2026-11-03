import { z } from 'zod';

export const notificationPreferencesPatchSchema = z
  .object({
    reviewRequests: z.boolean().optional(),
    news: z.boolean().optional(),
    salesAlerts: z.enum(['each', 'daily']).optional(),
  })
  .strict()
  .refine((patch) => Object.keys(patch).length > 0);

export const notificationIdParamsSchema = z.object({ id: z.string().trim().min(1).max(128) });
