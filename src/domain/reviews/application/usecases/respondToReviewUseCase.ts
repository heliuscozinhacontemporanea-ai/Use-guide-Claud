import { z } from 'zod';
import { reviewAdapter } from '../../factory';

const respondToReviewSchema = z.object({
  reviewId: z.string().trim().min(1, 'ID da avaliação é obrigatório'),
  partnerResponse: z
    .string()
    .trim()
    .min(1, 'A resposta não pode ser vazia')
    .max(500, 'A resposta deve possuir no máximo 500 caracteres'),
});

export async function respondToReviewUseCase(
  reviewId: string,
  partnerResponse: string
): Promise<void> {
  const data = respondToReviewSchema.parse({
    reviewId,
    partnerResponse,
  });
  await reviewAdapter.respondToReview(data.reviewId, data.partnerResponse);
}
