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
