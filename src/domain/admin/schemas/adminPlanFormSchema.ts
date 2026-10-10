import { z } from 'zod';
import { unmaskCurrency } from '../../../shared/utils/currencyMask';

export const adminPlanFormSchema = z.object({
  name: z.string().trim().min(1).max(200),
  price: z
    .string()
    .trim()
    .min(1, 'Informe o preço')
    .refine(
      (value) => Number.isFinite(unmaskCurrency(value)),
      'Preço inválido'
    )
    .refine(
      (value) => unmaskCurrency(value) >= 0,
      'Preço não pode ser negativo'
    ),
  period: z.string().trim().min(1).max(50),
  description: z.string().trim().max(300),
  isActive: z.boolean(),
});

export type AdminPlanFormValues =
  z.infer<typeof adminPlanFormSchema>;
