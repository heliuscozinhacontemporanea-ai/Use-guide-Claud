import { z } from 'zod';

export const trackInteractionSchema = z
  .object({
    itemId: z.string().trim().min(1, 'ID do item é obrigatório').max(200),
    itemCollection: z.enum(['items', 'events']),
    type: z.enum(['view', 'whatsapp_click', 'share', 'favorite']),
  })
  .strict();

export const getItemStatsParamsSchema = z
  .object({
    itemId: z.string().trim().min(1, 'ID do item é obrigatório').max(200),
    itemCollection: z.enum(['items', 'events']).default('items'),
  })
  .strict();
