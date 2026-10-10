import { z } from 'zod';

export const addFavoriteSchema = z.object({
  itemId: z.string().trim().min(1, 'ID do item é obrigatório'),
  itemCollection: z.enum(['items', 'events']),
});

export const removeFavoriteParamsSchema = z.object({
  itemCollection: z.enum(['items', 'events']),
  itemId: z.string().trim().min(1, 'ID do item é obrigatório'),
});

export type AddFavoriteInput = z.infer<typeof addFavoriteSchema>;
