import { z } from 'zod';
import { PROMO_CODE_PATTERN, PROMO_MAX_PERCENT } from '../../../../domain/promotions';

const isoDate = z.string().datetime({ offset: true });
const id = z.string().regex(/^[A-Za-z0-9_-]{1,128}$/);

export const PromoCodeParamsSchema = z.object({ id }).strict();

export const PromoCodeInputSchema = z
  .object({
    code: z
      .string()
      .trim()
      .transform((value) => value.toUpperCase())
      .pipe(z.string().regex(PROMO_CODE_PATTERN)),
    type: z.enum(['percentage', 'fixed']),
    percentage: z.number().int().min(1).max(PROMO_MAX_PERCENT).nullable(),
    valueMinor: z.number().int().min(1).max(100_000_00).nullable(),
    targets: z
      .array(
        z
          .object({
            kind: z.literal('event'),
            id,
            optionIds: z.array(id).min(1).max(100).nullable(),
          })
          .strict()
      )
      .min(1)
      .max(50),
    maxUses: z.number().int().min(1).max(100_000).nullable(),
    onePerAccount: z.boolean(),
    maxTicketsPerOrder: z.number().int().min(1).max(50).nullable(),
    startsAt: isoDate.nullable(),
    endsAt: isoDate.nullable(),
  })
  .strict()
  .refine((input) => (input.type === 'percentage' ? input.percentage : input.valueMinor) !== null, {
    message: 'Informe o desconto.',
  });

export const PromoCodeLimitsSchema = z
  .object({
    maxUses: z.number().int().min(1).max(100_000).nullable().optional(),
    endsAt: isoDate.nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .strict()
  .refine((edit) => Object.keys(edit).length > 0);
