import { z } from 'zod';

const id = z.string().trim().min(1).max(128);

export const gateStaffInviteSchema = z
  .object({
    scopeType: z.enum(['event', 'place']),
    scopeId: id,
    username: z.string().trim().min(3).max(31),
  })
  .strict();

export const gateStaffIdParamsSchema = z.object({ memberId: id }).strict();

export const gateStaffResponseSchema = z.object({ accept: z.boolean() }).strict();

export const gateOccurrenceParamsSchema = z.object({ occurrenceId: id }).strict();
