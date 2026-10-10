import { z } from 'zod';
import { reviewAdapter } from '../../factory';

const submitReviewSchema = z
  .object({
    itemId: z.string().trim().min(1, 'ID do item é obrigatório'),
    itemCollection: z.enum(['items', 'events']).default('items'),
    occurrenceId: z.string().trim().min(1).optional(),
    ticketId: z.string().trim().min(1).optional(),
    rating: z
      .number()
      .int('A nota deve ser um número inteiro')
      .min(1, 'Nota mínima é 1')
      .max(5, 'Nota máxima é 5'),
    comment: z
      .string()
      .trim()
      .min(1, 'Comentário é obrigatório')
      .max(500, 'Comentário deve possuir no máximo 500 caracteres'),
  })
  .strict();

export async function submitReviewUseCase(
  itemId: string,
  rating: number,
  comment: string,
  itemCollection: 'items' | 'events' = 'items',
  options?: { occurrenceId?: string; ticketId?: string }
): Promise<void> {
  const data = submitReviewSchema.parse({
    itemId,
    itemCollection,
    rating,
    comment,
    ...(options?.occurrenceId ? { occurrenceId: options.occurrenceId } : {}),
    ...(options?.ticketId ? { ticketId: options.ticketId } : {}),
  });
  if (data.occurrenceId || data.ticketId) {
    await reviewAdapter.submitReview(data.itemId, data.itemCollection, data.rating, data.comment, {
      occurrenceId: data.occurrenceId,
      ticketId: data.ticketId,
    });
    return;
  }
  await reviewAdapter.submitReview(data.itemId, data.itemCollection, data.rating, data.comment);
}
