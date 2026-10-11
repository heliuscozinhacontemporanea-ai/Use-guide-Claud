import { z } from 'zod';

export const StartPlanSubscriptionSchema = z
  .object({
    planId: z.enum(['monthly', 'semi-annual', 'annual']),
    locale: z.enum(['pt-BR', 'en', 'fr']),
    idempotencyKey: z.string().min(8).max(150),
  })
  .strict();

export const BillingPortalSchema = z
  .object({
    locale: z.enum(['pt-BR', 'en', 'fr']),
  })
  .strict();
