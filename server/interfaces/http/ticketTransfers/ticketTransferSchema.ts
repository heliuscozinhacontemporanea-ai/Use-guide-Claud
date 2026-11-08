import { z } from 'zod';

export const ticketTransferSchema = z
  .object({
    ticketId: z.string().trim().min(1).max(128),
    username: z.string().trim().min(3).max(31),
  })
  .strict();

export const ticketReturnSchema = z
  .object({ ticketId: z.string().trim().min(1).max(128) })
  .strict();

export const transferLinkTokenSchema = z
  .object({ token: z.string().trim().min(20).max(100) })
  .strict();
