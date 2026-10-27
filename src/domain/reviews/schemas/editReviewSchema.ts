import { z } from 'zod';

/** Mensagens são chaves de tradução; o formulário mostra `t(error.message)` (AGENTS.md §12.5). */
export const editReviewSchema = z.object({
  rating: z.number().int().min(1, 'myReviews.ratingRequired').max(5, 'myReviews.ratingRequired'),
  comment: z
    .string()
    .trim()
    .min(1, 'myReviews.commentRequired')
    .max(500, 'myReviews.commentTooLong'),
});

export type EditReviewForm = z.infer<typeof editReviewSchema>;
