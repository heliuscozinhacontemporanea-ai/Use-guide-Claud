import { z } from 'zod';

export const updatePlanSchema = z
  .object({
    name: z.string().trim().min(1).max(200).optional(),
    // Centavos inteiros: R$ 49,90 = 4990.
    priceMinor: z.number().int().nonnegative().max(100_000_000).optional(),
    period: z.string().trim().min(1).max(50).optional(),
    description: z.string().trim().max(300).optional(),
    features: z.array(z.string().trim().min(1).max(100)).optional(),
    badge: z.string().trim().max(50).optional(),
    isPopular: z.boolean().optional(),
    isActive: z.boolean().optional(),
    displayOrder: z.number().int().nonnegative().optional(),
  })
  .strict();

export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;
