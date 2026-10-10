import { z } from 'zod';

export const CreatePlanPaymentIntentSchema = z
  .object({
    planId: z.string().trim().min(1, 'planId é obrigatório'),
    idempotencyKey: z
      .string()
      .trim()
      .min(1, 'idempotencyKey é obrigatório')
      .max(150, 'idempotencyKey excede o tamanho máximo de 150 caracteres'),
  })
  .strict();

export type CreatePlanPaymentIntentDTO = z.infer<
  typeof CreatePlanPaymentIntentSchema
>;

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

export type CreateTicketPaymentIntentDTO = z.infer<
  typeof CreateTicketPaymentIntentSchema
>;

