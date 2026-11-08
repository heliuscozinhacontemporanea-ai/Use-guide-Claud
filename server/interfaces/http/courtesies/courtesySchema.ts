import { z } from 'zod';

const id = z.string().trim().min(1).max(128);

export const courtesyInviteSchema = z
  .object({ occurrenceId: id, username: z.string().trim().min(3).max(31) })
  .strict();

export const courtesyLinkCreateSchema = z.object({ occurrenceId: id }).strict();

export const courtesyLinkTokenSchema = z
  .object({ token: z.string().trim().min(20).max(100) })
  .strict();

export const courtesyListQuerySchema = z.object({ eventListingId: id }).strict();

export const courtesyIdParamsSchema = z.object({ courtesyId: id }).strict();
