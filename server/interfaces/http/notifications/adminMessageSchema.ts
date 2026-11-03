import { z } from 'zod';

export const sendAdminMessageSchema = z
  .object({
    recipientIds: z.union([
      z.array(z.string().trim().min(1).max(128)).min(1).max(500),
      z.literal('all'),
    ]),
    title: z.string().trim().min(1).max(100),
    message: z.string().trim().min(1).max(500),
  })
  .strict();
