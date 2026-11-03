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

// Token do FCM: string opaca de ~150–200 caracteres; o limite só barra lixo.
export const pushDeviceSchema = z
  .object({
    token: z.string().trim().min(20).max(4096),
    locale: z.string().trim().max(10).optional(),
  })
  .strict();
