import { z } from 'zod';

export const ListingPlanParamsSchema = z
  .object({
    itemId: z
      .string()
      .min(1)
      .max(128)
      .regex(/^[\w-]+$/),
  })
  .strict();

// O admin só diz se concede ou retira o selo; tipo e validade são decididos no servidor (D8).
export const SetListingSealSchema = z.object({ grant: z.boolean() }).strict();
