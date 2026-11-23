import { z } from 'zod';

export const AdminListingParamsSchema = z
  .object({ itemId: z.string().regex(/^[A-Za-z0-9_-]{1,128}$/) })
  .strict();
