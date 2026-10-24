import { z } from 'zod';

export const CreatePlanPaymentIntentSchema = z
  .object({
    itemId: z
      .string()
      .trim()
      .min(1, 'itemId é obrigatório')
      .max(128, 'itemId inválido')
      .regex(/^[\w-]+$/, 'itemId inválido'),
    planId: z.enum(['monthly', 'semi-annual', 'annual']),
    idempotencyKey: z
      .string()
      .trim()
      .min(1, 'idempotencyKey é obrigatório')
      .max(150, 'idempotencyKey excede o tamanho máximo de 150 caracteres'),
  })
  .strict();

export type CreatePlanPaymentIntentDTO = z.infer<typeof CreatePlanPaymentIntentSchema>;

export const ConfirmPlanPaymentSchema = z
  .object({ paymentIntentId: z.string().trim().regex(/^pi_[A-Za-z0-9]+$/) })
  .strict();

export const CreateTicketPaymentIntentSchema = z
  .object({
    orderId: z.string().trim().min(1, 'orderId é obrigatório'),
    idempotencyKey: z
      .string()
      .trim()
      .min(1, 'idempotencyKey é obrigatório')
      .max(150, 'idempotencyKey excede o tamanho máximo de 150 caracteres'),
  })
  .strict();

export type CreateTicketPaymentIntentDTO = z.infer<typeof CreateTicketPaymentIntentSchema>;
