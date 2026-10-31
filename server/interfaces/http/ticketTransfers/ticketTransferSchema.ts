import { z } from 'zod';

export const ticketTransferSchema = z
  .object({
    ticketId: z.string().trim().min(1).max(128),
    username: z.string().trim().min(3).max(31),
  })
  .strict();
