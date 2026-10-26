import { z } from 'zod';

const ID = z
  .string()
  .min(1)
  .max(200)
  .regex(/^[\w-]+$/);

// Mesma lista fechada de `SALE_CLAIM_REASONS` (D16, 2A); o teste do controller confere a paridade.
export const SALE_CLAIM_REASON_VALUES = [
  'did_not_happen',
  'not_as_described',
  'changed_without_notice',
  'safety_issue',
  'other',
] as const;

export const OpenSaleClaimSchema = z
  .object({
    referenceType: z.enum(['ticket_order', 'booking']),
    referenceId: ID,
    reason: z.enum(SALE_CLAIM_REASON_VALUES),
    details: z.string().trim().max(500).optional(),
  })
  .strict();

export const SaleClaimParamsSchema = z.object({ claimId: ID }).strict();

export const ListSaleClaimsQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(100).default(50),
    cursor: ID.optional(),
  })
  .strict();

export const DecideSaleClaimSchema = z
  .object({
    outcome: z.enum(['release', 'refund_full', 'refund_partial']),
    amountMinor: z.number().int().positive().optional(),
    chargePenalty: z.boolean().optional(),
  })
  .strict()
  .refine((value) => (value.outcome === 'refund_partial') === (value.amountMinor !== undefined), {
    message: 'amountMinor só no reembolso parcial, e obrigatório nele.',
  });
