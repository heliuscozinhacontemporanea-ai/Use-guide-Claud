import { z } from 'zod';

export const payTicketOrderSchema = z
  .object({
    idempotencyKey: z.string().trim().min(1).max(150).optional(),
  })
  .strict();

export const requestTicketRefundSchema = z
  .object({
    reason: z.string().trim().min(1).max(500),
    ticketId: z.string().trim().min(1).optional(),
    idempotencyKey: z.string().trim().min(1).max(150),
  })
  .strict();
