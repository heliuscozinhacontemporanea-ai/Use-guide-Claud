import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useReviews } from './useReviews';
import { getReviewsUseCase } from '../application/usecases/getReviewsUseCase';
import { getUserReviewUseCase } from '../application/usecases/getUserReviewUseCase';
import { subscribeToReviewsUseCase } from '../application/usecases/subscribeToReviewsUseCase';
import { submitReviewUseCase } from '../application/usecases/submitReviewUseCase';
import { FirestoreReview } from '../types/review';

vi.mock('../application/usecases/getReviewsUseCase', () => ({
  getReviewsUseCase: vi.fn(),
}));

vi.mock('../application/usecases/getUserReviewUseCase', () => ({
  getUserReviewUseCase: vi.fn(),
}));

vi.mock('../application/usecases/subscribeToReviewsUseCase', () => ({
  subscribeToReviewsUseCase: vi.fn(),
}));

vi.mock('../application/usecases/submitReviewUseCase', () => ({
  submitReviewUseCase: vi.fn(),
}));

describe('useReviews Hook', () => {
  let subscribeCallback: ((reviews: FirestoreReview[]) => void) | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
    subscribeCallback = null;

    vi.mocked(subscribeToReviewsUseCase).mockImplementation(
      (_itemId, _pageSize, _sortBy, onUpdate) => {
        subscribeCallback = onUpdate;
        return () => {};
      }
    );

    vi.mocked(getReviewsUseCase).mockResolvedValue({
      items: [],
      cursor: null,
      hasMore: false,
    });

    vi.mocked(getUserReviewUseCase).mockResolvedValue(null);
  });

  it('deve carregar primeira página e combinar com a janela de realtime ordenada', async () => {
    const page1Reviews: FirestoreReview[] = [
      {
        id: 'rev-b',
        itemId: 'item-1',
        itemCollection: 'items',
        userId: 'user-b',
        userName: 'B',
        rating: 4,
        comment: 'Bom',
        createdAt: new Date('2026-09-10T10:00:00Z'),
      },
    ];

    vi.mocked(getReviewsUseCase).mockResolvedValue({
      items: page1Reviews,
      cursor: { values: [new Date('2026-09-10T10:00:00Z')] },
      hasMore: true,
    });

    const { result } = renderHook(() => useReviews('item-1', 'user-me'));

    await act(async () => {});

    expect(result.current.reviews).toHaveLength(1);
    expect(result.current.hasMore).toBe(true);

    const newRealtimeReview: FirestoreReview = {
      id: 'rev-a',
      itemId: 'item-1',
      itemCollection: 'items',
      userId: 'user-a',
      userName: 'A',
      rating: 5,
      comment: 'Mais recente!',
      createdAt: new Date('2026-09-12T10:00:00Z'),
    };

    act(() => {
      subscribeCallback?.([newRealtimeReview, page1Reviews[0]!]);
    });

    expect(result.current.reviews).toHaveLength(2);
    expect(result.current.reviews[0]?.id).toBe('rev-a');
    expect(result.current.reviews[1]?.id).toBe('rev-b');
  });

  it('deve manter páginas carregadas via cursor sem perder novo item chegado em realtime', async () => {
    const pagedItem: FirestoreReview = {
      id: 'rev-old',
      itemId: 'item-1',
      itemCollection: 'items',
      userId: 'user-old',
      userName: 'Old',
      rating: 3,
      comment: 'Antigo da página 2',
      createdAt: new Date('2026-08-01T10:00:00Z'),
    };

    vi.mocked(getReviewsUseCase)
      .mockResolvedValueOnce({
        items: [
          {
            id: 'rev-page1',
            itemId: 'item-1',
            itemCollection: 'items',
            userId: 'user-1',
            userName: 'User 1',
            rating: 5,
            comment: 'Página 1',
            createdAt: new Date('2026-09-01T10:00:00Z'),
          },
        ],
        cursor: { values: ['cursor-page1'] },
        hasMore: true,
      })
      .mockResolvedValueOnce({
        items: [pagedItem],
        cursor: null,
        hasMore: false,
      });

    const { result } = renderHook(() => useReviews('item-1'));

    await act(async () => {});
    expect(result.current.reviews).toHaveLength(1);

    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.reviews).toHaveLength(2);
    expect(result.current.hasMore).toBe(false);

    const brandNewItem: FirestoreReview = {
      id: 'rev-new',
      itemId: 'item-1',
      itemCollection: 'items',
      userId: 'user-new',
      userName: 'Novo',
      rating: 5,
      comment: 'Chegou agora!',
      createdAt: new Date('2026-09-12T10:00:00Z'),
    };

    act(() => {
      subscribeCallback?.([brandNewItem]);
    });

    expect(result.current.reviews).toHaveLength(3);
    expect(result.current.reviews[0]?.id).toBe('rev-new');
    expect(result.current.reviews[1]?.id).toBe('rev-page1');
    expect(result.current.reviews[2]?.id).toBe('rev-old');
  });

  it('deve submeter avaliação e atualizar o realtimeReviews e userReview', async () => {
    const createdReview: FirestoreReview = {
      id: 'item-1__user-1',
      itemId: 'item-1',
      itemCollection: 'items',
      userId: 'user-1',
      userName: 'Eu',
      rating: 5,
      comment: 'Excelente',
      createdAt: new Date('2026-09-12T10:00:00Z'),
    };

    vi.mocked(submitReviewUseCase).mockResolvedValue(undefined);
    vi.mocked(getUserReviewUseCase).mockResolvedValue(createdReview);

    const { result } = renderHook(() => useReviews('item-1', 'user-1'));

    await act(async () => {});

    await act(async () => {
      await result.current.submitReview(5, 'Excelente');
    });

    expect(submitReviewUseCase).toHaveBeenCalledWith('item-1', 5, 'Excelente', 'items');
    expect(result.current.userReview).toEqual(createdReview);
    expect(result.current.reviews.some((r) => r.id === 'item-1__user-1')).toBe(true);
  });
});
