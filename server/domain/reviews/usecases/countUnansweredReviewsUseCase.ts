import { reviewService } from '../factory';

/** Avaliações sem resposta por item do guia; quem chama garante que os itens são do parceiro. */
export function countUnansweredReviewsUseCase(itemIds: string[]): Promise<Record<string, number>> {
  return reviewService.countUnansweredByItems(itemIds);
}
