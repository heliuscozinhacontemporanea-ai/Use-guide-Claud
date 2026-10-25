import { z } from 'zod';

// `accountKey` é o índice cego do CNPJ: HMAC-SHA-256 em base64url (43 caracteres).
export const PaymentAccountSessionSchema = z
  .object({ accountKey: z.string().regex(/^[\w-]{43}$/) })
  .strict();

export const AcceptPartnerTermsSchema = z
  .object({ version: z.string().trim().min(1).max(40) })
  .strict();

export const ListPaymentAccountsQuerySchema = z
  .object({
    ownerUid: z
      .string()
      .min(1)
      .max(128)
      .regex(/^[\w-]+$/)
      .optional(),
  })
  .strict();
