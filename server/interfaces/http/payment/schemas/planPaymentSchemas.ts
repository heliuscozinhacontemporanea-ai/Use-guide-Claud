import { z } from 'zod';

export const CreatePlanPaymentIntentSchema = z
  .object({
    itemId: z
      .string()
      .min(1)
      .max(128)
      .regex(/^[\w-]+$/),
    planId: z.enum(['monthly', 'semi-annual', 'annual']),
    idempotencyKey: z
      .string()
      .trim()
      .min(1, 'idempotencyKey é obrigatório')
      .max(150, 'idempotencyKey excede o tamanho máximo de 150 caracteres'),
  })
  .strict();

export const ConfirmPlanPaymentSchema = z
  .object({
    paymentIntentId: z
      .string()
      .trim()
      .regex(/^pi_[A-Za-z0-9]+$/),
  })
  .strict();
