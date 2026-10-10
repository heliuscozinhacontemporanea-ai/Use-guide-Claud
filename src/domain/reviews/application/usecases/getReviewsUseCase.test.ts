import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getReviewsUseCase } from './getReviewsUseCase';
import { reviewAdapter } from '../../factory';
import { DatabasePage } from '../../../database/ports/databasePort';
import { FirestoreReview } from '../../types/review';

vi.mock('../../factory', () => ({
  reviewAdapter: {
    getReviews: vi.fn(),
    getAllReviews: vi.fn(),
    submitReview: vi.fn(),
    respondToReview: vi.fn(),
    subscribeToReviews: vi.fn(),
    getUserReview: vi.fn(),
  },
}));

describe('getReviewsUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve chamar adapter com os parâmetros de consulta validados', async () => {
    const createdAt = new Date('2026-09-12T00:00:00.000Z');
    const mockPage: DatabasePage<FirestoreReview> = {
      items: [
        {
          id: 'rev-1',
          itemId: 'item-1',
          itemCollection: 'items',
          userId: 'user-1',
          userName: 'João',
          rating: 5,
          comment: 'Muito bom',
          createdAt,
        },
      ],
      cursor: null,
      hasMore: false,
    };

    vi.mocked(reviewAdapter.getReviews).mockResolvedValue(mockPage);

    const result = await getReviewsUseCase('item-1', 10, 'recent');

    expect(result).toEqual(mockPage);
    expect(reviewAdapter.getReviews).toHaveBeenCalledWith(
      'item-1',
      'items',
      10,
      'recent',
      undefined
    );
  });

  it('deve rejeitar chamada com itemId vazio', async () => {
    await expect(getReviewsUseCase('')).rejects.toThrow();
  });

  it('deve rejeitar limite fora do intervalo permitido', async () => {
    await expect(getReviewsUseCase('item-1', 0, 'recent')).rejects.toThrow();

    await expect(getReviewsUseCase('item-1', 51, 'recent')).rejects.toThrow();
  });

  it('deve aceitar cursor compatível com a ordenação', async () => {
    const cursorDate = new Date('2026-09-12T00:00:00.000Z');
    const mockPage: DatabasePage<FirestoreReview> = {
      items: [],
      cursor: null,
      hasMore: false,
    };

    vi.mocked(reviewAdapter.getReviews).mockResolvedValue(mockPage);

    await getReviewsUseCase('item-1', 10, 'recent', {
      values: [cursorDate],
    });

    expect(reviewAdapter.getReviews).toHaveBeenCalledWith('item-1', 'items', 10, 'recent', {
      values: [cursorDate],
    });
  });
});
