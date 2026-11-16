import { z } from 'zod';

/** Sem `partnerId`, encerra o próprio perfil; com ele, só o admin encerra o de outra pessoa. */
export const PartnerClosureParamsSchema = z
  .object({ partnerId: z.string().trim().min(1).max(128).optional() })
  .strict();
