import { z } from 'zod';

export const ListingStatsParamsSchema = z
  .object({
    itemId: z.string().trim().min(1).max(200),
    itemCollection: z.enum(['items', 'events']),
  })
  .strict();
