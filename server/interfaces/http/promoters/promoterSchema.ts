import { z } from 'zod';

const id = z.string().trim().min(1).max(128);

const earningSchema = z.discriminatedUnion('type', [
  z
    .object({ type: z.literal('commission'), basisPoints: z.number().int().min(1).max(10_000) })
    .strict(),
  z
    .object({
      type: z.literal('per_ticket'),
      amountMinor: z.number().int().min(1).max(100_000_000),
    })
    .strict(),
  z
    .object({ type: z.literal('flat_fee'), amountMinor: z.number().int().min(1).max(100_000_000) })
    .strict(),
]);

export const promoterInviteSchema = z
  .object({
    eventListingId: id,
    username: z.string().trim().min(3).max(31),
    earning: earningSchema,
  })
  .strict();

export const promoterListQuerySchema = z.object({ eventListingId: id }).strict();

export const promoterIdParamsSchema = z.object({ promoterId: id }).strict();

export const promoterResponseSchema = z.object({ accept: z.boolean() }).strict();
