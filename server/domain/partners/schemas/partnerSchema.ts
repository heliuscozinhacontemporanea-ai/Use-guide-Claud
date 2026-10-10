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
    verifiedUntil: z
      .string()
      .datetime({
        offset: true,
      })
      .nullable(),
    verificationType: z.enum(['trial', 'monthly', 'semi-annual', 'annual']).nullable(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.isVerified) {
      if (!data.verifiedUntil) {
        ctx.addIssue({
          code: 'custom',
          path: ['verifiedUntil'],
          message: 'verifiedUntil é obrigatório quando o parceiro está verificado.',
        });
      }
      if (!data.verificationType) {
        ctx.addIssue({
          code: 'custom',
          path: ['verificationType'],
          message: 'verificationType é obrigatório quando o parceiro está verificado.',
        });
      }
    }
    if (!data.isVerified && data.verifiedUntil !== null) {
      ctx.addIssue({
        code: 'custom',
        path: ['verifiedUntil'],
        message: 'verifiedUntil deve ser null quando isVerified=false.',
      });
    }
    if (!data.isVerified && data.verificationType !== null) {
      ctx.addIssue({
        code: 'custom',
        path: ['verificationType'],
        message: 'verificationType deve ser null quando isVerified=false.',
      });
    }
  });

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
