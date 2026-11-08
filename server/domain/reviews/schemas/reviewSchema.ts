import { z } from 'zod';

export const reviewItemCollectionSchema = z.enum(['items', 'events']);

export const submitReviewSchema = z
  .object({
    itemId: z.string().trim().min(1, 'ID do item é obrigatório').max(200, 'ID do item inválido'),
    itemCollection: reviewItemCollectionSchema,
    occurrenceId: z.string().trim().min(1).max(200).optional(),
    ticketId: z.string().trim().min(1).max(200).optional(),
    bookingId: z.string().trim().min(1).max(200).optional(),
    rating: z
      .number()
      .int('Nota deve ser um número inteiro')
      .min(1, 'Nota deve ser entre 1 e 5')
      .max(5, 'Nota deve ser entre 1 e 5'),
    comment: z
      .string()
      .trim()
      .min(1, 'Comentário é obrigatório')
      .max(1000, 'Comentário deve ter no máximo 1000 caracteres'),
  })
  .strict();

export const respondReviewSchema = z
  .object({
    response: z
      .string()
      .trim()
      .min(1, 'Resposta não pode ser vazia')
      .max(1000, 'Resposta deve ter no máximo 1000 caracteres'),
  })
  .strict();

export type SubmitReviewInput = z.infer<typeof submitReviewSchema>;
export type RespondReviewInput = z.infer<typeof respondReviewSchema>;
