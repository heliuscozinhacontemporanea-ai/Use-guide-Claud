import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FirestoreReviewAdapter } from './firestoreReviewAdapter';

const mocks = vi.hoisted(() => ({
  auth: {
    currentUser: null as any,
  },
  database: {
    getDocumentUseCase: vi.fn(),
    queryDocumentsUseCase: vi.fn(),
    queryDocumentsPageUseCase: vi.fn(),
    subscribeToCollectionUseCase: vi.fn(),
  },
  firebaseApiFetch: vi.fn(),
}));

vi.mock('../../../shared/infrastructure/firebase/firebaseAuth', () => ({
  auth: mocks.auth,
}));

vi.mock('../../../shared/infrastructure/firebase/firebaseApiFetch', () => ({
  firebaseApiFetch: mocks.firebaseApiFetch,
}));

vi.mock('../../database', () => ({
  getDocumentUseCase: mocks.database.getDocumentUseCase,
  queryDocumentsUseCase: mocks.database.queryDocumentsUseCase,
  queryDocumentsPageUseCase: mocks.database.queryDocumentsPageUseCase,
  subscribeToCollectionUseCase: mocks.database.subscribeToCollectionUseCase,
}));

describe('Frontend FirestoreReviewAdapter', () => {
  let adapter: FirestoreReviewAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new FirestoreReviewAdapter();
  });

  describe('submitReview', () => {
    it('deve enviar apenas os campos permitidos para o endpoint', async () => {
      mocks.firebaseApiFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'success', id: 'review-1' }),
      } as Response);

      await adapter.submitReview('item-1', 'items', 5, 'Muito bom');

      expect(mocks.firebaseApiFetch).toHaveBeenCalledWith(
        '/api/reviews',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            itemId: 'item-1',
            itemCollection: 'items',
            rating: 5,
            comment: 'Muito bom',
          }),
        }),
        { requireAuth: true }
      );
    });

    it('deve repassar mensagem de erro retornada pelo servidor', async () => {
      mocks.firebaseApiFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Parceiros não podem avaliar' }),
      } as Response);

      await expect(adapter.submitReview('item-1', 'items', 5, 'Muito bom')).rejects.toThrow(
        'Parceiros não podem avaliar'
      );
    });
  });

  describe('getUserReview', () => {
    it('deve buscar review do usuário usando ID determinístico', async () => {
      const mockReview = {
        id: 'items__item-1__user-1',
        itemId: 'item-1',
        itemCollection: 'items' as const,
        userId: 'user-1',
        rating: 5,
        comment: 'Ótimo lugar',
      };

      mocks.database.getDocumentUseCase.mockResolvedValue(mockReview);

      const review = await adapter.getUserReview('item-1', 'items', 'user-1');

      expect(mocks.database.getDocumentUseCase).toHaveBeenCalledWith(
        'reviews',
        'items__item-1__user-1'
      );
      expect(review).toEqual(mockReview);
    });
  });
});
