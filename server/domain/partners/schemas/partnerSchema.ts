import { z } from 'zod';

export const updatePartnerStatusSchema = z
  .object({
    partnerId: z.string().trim().min(1),
    status: z.enum(['active', 'suspended']),
  })
  .strict();

export type UpdatePartnerStatusInput = z.infer<typeof updatePartnerStatusSchema>;
