import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitReviewUseCase } from './submitReviewUseCase';
import { reviewAdapter } from '../../factory';

vi.mock('../../factory', () => ({
  reviewAdapter: {
    submitReview: vi.fn(),
    getReviews: vi.fn(),
    getAllReviews: vi.fn(),
    respondToReview: vi.fn(),
    subscribeToReviews: vi.fn(),
    getUserReview: vi.fn(),
  },
}));

describe('submitReviewUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve submeter a avaliação com payload válido', async () => {
    vi.mocked(reviewAdapter.submitReview).mockResolvedValue(undefined);

    await submitReviewUseCase('item-abc', 5, 'Lugar maravilhoso com praia limpa!');

    expect(reviewAdapter.submitReview).toHaveBeenCalledWith(
      'item-abc',
      'items',
      5,
      'Lugar maravilhoso com praia limpa!'
    );
  });

  it('deve lançar erro de validação para nota inválida (< 1 ou > 5)', async () => {
    await expect(submitReviewUseCase('item-abc', 6, 'Nota inválida')).rejects.toThrow();

    await expect(submitReviewUseCase('item-abc', 0, 'Nota zero')).rejects.toThrow();
  });

  it('deve lançar erro para comentário vazio', async () => {
    await expect(submitReviewUseCase('item-abc', 4, '')).rejects.toThrow();
  });
});
