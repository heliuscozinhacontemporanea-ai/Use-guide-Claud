import { z } from 'zod';
import { isValidCpfCnpj } from '../services/documentIdentity';

const partnerCategorySchema = z.enum(['sight', 'hotel', 'restaurant', 'event']);

const registerPartnerFormSchema = z
  .object({
    category: partnerCategorySchema,
    cpfCnpj: z
      .string()
      .trim()
      .min(1, 'CPF/CNPJ é obrigatório')
      .refine(isValidCpfCnpj, 'CPF/CNPJ inválido'),
    termsAccepted: z.literal(true),
  })
  .strict();

export const registerPartnerSchema = z
  .object({
    formData: registerPartnerFormSchema,
  })
  .strict();

export const verifyPartnerSchema = z
  .object({
    partnerId: z.string().trim().min(1, 'ID do parceiro é obrigatório'),
    isVerified: z.boolean(),
  })
  .strict();

export const activateTrialSchema = z
  .object({
    partnerId: z.string().trim().min(1),
  })
  .strict();

export const updatePartnerStatusSchema = z
  .object({
    partnerId: z.string().trim().min(1),
    status: z.enum(['active', 'pending', 'suspended']),
  })
  .strict();

export type RegisterPartnerInput = z.infer<typeof registerPartnerSchema>;
export type VerifyPartnerInput = z.infer<typeof verifyPartnerSchema>;
export type ActivateTrialInput = z.infer<typeof activateTrialSchema>;
export type UpdatePartnerStatusInput = z.infer<typeof updatePartnerStatusSchema>;
