import { z } from 'zod';

const ITEM_ID = z
  .string()
  .min(1)
  .max(128)
  .regex(/^[\w-]+$/);

export const StartPlanSubscriptionSchema = z
  .object({
    itemId: ITEM_ID,
    planId: z.enum(['monthly', 'semi-annual', 'annual']),
    locale: z.enum(['pt-BR', 'en', 'fr']),
    idempotencyKey: z.string().min(8).max(150),
  })
  .strict();

/** Assinatura de um estabelecimento: `?itemId=` na leitura, `{ itemId }` em cancelar e retomar. */
export const ListingSubscriptionSchema = z.object({ itemId: ITEM_ID }).strict();

export const BillingPortalSchema = z
  .object({
    locale: z.enum(['pt-BR', 'en', 'fr']),
  })
  .strict();
