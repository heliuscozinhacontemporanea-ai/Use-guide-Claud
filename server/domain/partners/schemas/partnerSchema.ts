import { z } from 'zod';

// O documento é de cada estabelecimento, enviado na verificação (D12); a conta só aceita os termos.
const registerPartnerFormSchema = z
  .object({
    termsAccepted: z.literal(true),
  })
  .strict();

export const registerPartnerSchema = z
  .object({
    formData: registerPartnerFormSchema,
  })
  .strict();

// O admin só diz se concede ou retira o selo; tipo e validade são decididos no servidor
// para nunca sobrescrever o plano pago do parceiro.
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
    status: z.enum(['active', 'suspended']),
  })
  .strict();

export type RegisterPartnerInput = z.infer<typeof registerPartnerSchema>;
export type VerifyPartnerInput = z.infer<typeof verifyPartnerSchema>;
export type ActivateTrialInput = z.infer<typeof activateTrialSchema>;
export type UpdatePartnerStatusInput = z.infer<typeof updatePartnerStatusSchema>;
