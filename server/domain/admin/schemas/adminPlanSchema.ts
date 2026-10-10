import { z } from 'zod';

const finiteNonNegativeNumber = z.preprocess(
  (value) => {
    if (typeof value === 'string') {
      const normalized = value.trim();
      if (!normalized) {
        return undefined;
      }
      return Number(normalized);
    }
    return value;
  },
  z.number().finite().nonnegative()
);

export const updatePlanSchema = z
  .object({
    name: z.string().trim().min(1).max(200).optional(),
    price: finiteNonNegativeNumber.optional(),
    period: z.string().trim().min(1).max(50).optional(),
    description: z.string().trim().max(300).optional(),
    isActive: z.boolean().optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Informe ao menos um campo para atualizar',
  });

export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;
