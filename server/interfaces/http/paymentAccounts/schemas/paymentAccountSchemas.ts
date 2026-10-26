import { z } from 'zod';

// `accountKey` é o índice cego do CNPJ: HMAC-SHA-256 em base64url (43 caracteres).
export const PaymentAccountSessionSchema = z
  .object({ accountKey: z.string().regex(/^[\w-]{43}$/) })
  .strict();

export const AcceptPartnerTermsSchema = z
  .object({ version: z.string().trim().min(1).max(40) })
  .strict();

// IDs de dívida são determinísticos (`debt_<motivo>_<tipo>_<referência>`).
export const AccountDebtParamsSchema = z
  .object({
    debtId: z
      .string()
      .min(1)
      .max(200)
      .regex(/^[\w-]+$/),
  })
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

export const DeclareForceMajeureSchema = z
  .object({
    reason: z.string().trim().min(10).max(500),
    proofPath: z
      .string()
      .min(1)
      .max(300)
      .regex(/^[\w/.-]+$/),
  })
  .strict();

export const DecideForceMajeureSchema = z.object({ approve: z.boolean() }).strict();

export const ListPayoutsQuerySchema = z
  .object({
    accountKey: z
      .string()
      .regex(/^[\w-]{43}$/)
      .optional(),
    limit: z.coerce.number().int().min(1).max(100).default(30),
    cursor: z
      .string()
      .max(200)
      .regex(/^[\w-]+$/)
      .optional(),
  })
  .strict();

export const ListAdminAccountDebtsQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(100).default(50),
    cursor: z
      .string()
      .min(1)
      .max(200)
      .regex(/^[\w-]+$/)
      .optional(),
  })
  .strict();
