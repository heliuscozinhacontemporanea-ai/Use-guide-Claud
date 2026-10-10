import { beforeEach, describe, expect, it, vi } from 'vitest';

const guideMocks = vi.hoisted(() => ({
  getResourceOwnerIdUseCase: vi.fn(),
  getItemByIdUseCase: vi.fn(),
  updateReviewAggregateUseCase: vi.fn(),
}));

const eventMocks = vi.hoisted(() => ({
  getEventListingByIdUseCase: vi.fn(),
  updateEventRatingSummaryUseCase: vi.fn(),
}));

const userMocks = vi.hoisted(() => ({
  getUserPublicProfileUseCase: vi.fn(),
}));

vi.mock('../../guide', () => ({
  getResourceOwnerIdUseCase: guideMocks.getResourceOwnerIdUseCase,
  getItemByIdUseCase: guideMocks.getItemByIdUseCase,
  updateReviewAggregateUseCase: guideMocks.updateReviewAggregateUseCase,
}));

vi.mock('../../users', () => ({
  getUserPublicProfileUseCase: userMocks.getUserPublicProfileUseCase,
}));

vi.mock('../../events', () => ({
  getEventListingByIdUseCase: eventMocks.getEventListingByIdUseCase,
  updateEventRatingSummaryUseCase: eventMocks.updateEventRatingSummaryUseCase,
}));

interface MockDocRef {
  collection: string;
  id: string;
  path: string;
  update: ReturnType<typeof vi.fn>;
  set: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  get: ReturnType<typeof vi.fn>;
}

const mocks = vi.hoisted(() => {
  const docRefs = new Map<string, MockDocRef>();

  const getDocRef = (col: string, id: string): MockDocRef => {
    const key = `${col}/${id}`;
    let ref = docRefs.get(key);
    if (!ref) {
      ref = {
        collection: col,
        id,
        path: key,
        update: vi.fn().mockResolvedValue(undefined),
        set: vi.fn().mockResolvedValue(undefined),
        delete: vi.fn().mockResolvedValue(undefined),
        get: vi.fn().mockResolvedValue({ exists: false, data: () => ({}) }),
      };
      docRefs.set(key, ref);
    }
    return ref;
  };

  const createQueryObj = (
    col: string,
    filters: Array<{ field: string; op: string; val: any }> = []
  ) => {
    const queryObj: any = {
      _col: col,
      _filters: [...filters],
      where: vi.fn((field: string, op: string, val: any) => {
        return createQueryObj(col, [...filters, { field, op, val }]);
      }),
      get: vi.fn().mockResolvedValue({ empty: true, forEach: () => {}, docs: [] }),
    };
    return queryObj;
  };

  const mockBatch = {
    delete: vi.fn(),
    commit: vi.fn().mockResolvedValue(undefined),
  };

  const adminDb = {
    collection: vi.fn((col: string) => ({
      doc: (id: string) => getDocRef(col, id),
      where: (field: string, op: string, val: any) => createQueryObj(col, [{ field, op, val }]),
      get: vi.fn().mockResolvedValue({ empty: true, docs: [] }),
    })),
    batch: vi.fn(() => mockBatch),
  };

  return {
    adminDb,
    getDocRef,
    docRefs,
    mockBatch,
    FieldValue: {
      serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP'),
    },
  };
});

vi.mock('../../../infrastructure/firebase/adminClient', () => ({
  adminDb: mocks.adminDb,
}));

vi.mock('firebase-admin/firestore', () => ({
  FieldValue: mocks.FieldValue,
}));

import { FirestoreReviewAdapter } from './firestoreReviewAdapter';

describe('FirestoreReviewAdapter — respondToReview Authorization', () => {
  let adapter: FirestoreReviewAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new FirestoreReviewAdapter();
  });

  it('deve rejeitar partnerId quando ele não é o owner atual', async () => {
    const reviewRef = mocks.getDocRef('reviews', 'review-id');
    reviewRef.get.mockResolvedValue({
      exists: true,
      data: () => ({
        itemId: 'item-1',
        itemCollection: 'items',
      }),
    });

    guideMocks.getResourceOwnerIdUseCase.mockResolvedValue('owner-atual');

    await expect(
      adapter.respondToReview('review-id', 'Resposta', 'partner-antigo', false)
    ).rejects.toThrow('Não autorizado a responder esta avaliação');
  });

  it('deve permitir o owner atual do item responder à avaliação', async () => {
    const reviewRef = mocks.getDocRef('reviews', 'review-id');
    reviewRef.get.mockResolvedValue({
      exists: true,
      data: () => ({
        itemId: 'item-1',
        itemCollection: 'items',
      }),
    });

    guideMocks.getResourceOwnerIdUseCase.mockResolvedValue('owner-atual');

    await expect(
      adapter.respondToReview('review-id', 'Resposta do proprietário', 'owner-atual', false)
    ).resolves.toBeUndefined();

    expect(reviewRef.update).toHaveBeenCalledWith(
      expect.objectContaining({
        partnerResponse: 'Resposta do proprietário',
        responderId: 'owner-atual',
      })
    );
  });

  it('deve permitir admin responder mesmo sem ser owner', async () => {
    const reviewRef = mocks.getDocRef('reviews', 'review-id');
    reviewRef.get.mockResolvedValue({
      exists: true,
      data: () => ({
        itemId: 'item-1',
        itemCollection: 'items',
      }),
    });

    await expect(
      adapter.respondToReview('review-id', 'Moderação oficial da plataforma', 'admin-id', true)
    ).resolves.toBeUndefined();

    expect(reviewRef.update).toHaveBeenCalledWith(
      expect.objectContaining({
        partnerResponse: 'Moderação oficial da plataforma',
        responderId: 'admin-id',
      })
    );
  });

  it('deve rejeitar quando a avaliação não existir', async () => {
    const reviewRef = mocks.getDocRef('reviews', 'review-inexistente');
    reviewRef.get.mockResolvedValue({
      exists: false,
      data: () => undefined,
    });

    await expect(
      adapter.respondToReview('review-inexistente', 'Resposta', 'admin-id', true)
    ).rejects.toThrow('Avaliação não encontrada');
  });
});

describe('FirestoreReviewAdapter — submitReviewAndRecalculateRating', () => {
  let adapter: FirestoreReviewAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new FirestoreReviewAdapter();
  });

  it('deve criar primeira review e chamar updateReviewAggregateUseCase', async () => {
    guideMocks.getResourceOwnerIdUseCase.mockResolvedValue('owner-1');
    guideMocks.getItemByIdUseCase.mockResolvedValue({
      id: 'item-1',
      name: 'Restaurante Teste',
      rating: 0,
      reviewCount: 0,
    });
    userMocks.getUserPublicProfileUseCase.mockResolvedValue({
      displayName: 'Carlos Silva',
      photoURL: 'https://example.com/photo.jpg',
    });

    const reviews = [{ rating: 5 }];
    const queryObj = {
      where: vi.fn(() => queryObj),
      get: vi.fn().mockResolvedValue({
        empty: false,
        docs: reviews.map((r) => ({ data: () => r })),
        forEach: (cb: any) => {
          reviews.forEach((r) => {
            cb({ data: () => r });
          });
        },
      }),
    };

    mocks.adminDb.collection.mockImplementation(((col: string) => {
      if (col === 'reviews') {
        return {
          doc: (id: string) => mocks.getDocRef(col, id),
          where: () => queryObj,
        };
      }
      return { doc: (id: string) => mocks.getDocRef(col, id) };
    }) as any);

    const result = await adapter.submitReviewAndRecalculateRating({
      itemId: 'item-1',
      itemCollection: 'items',
      rating: 5,
      comment: 'Excelente!',
      userId: 'user-normal',
    });

    expect(result.reviewId).toBeDefined();
    expect(result.itemId).toBe('item-1');
    expect(guideMocks.updateReviewAggregateUseCase).toHaveBeenCalledWith('items', 'item-1', 5, 1);
  });

  it('deve impedir que o dono do estabelecimento se autoavalie', async () => {
    guideMocks.getResourceOwnerIdUseCase.mockResolvedValue('partner-123');

    await expect(
      adapter.submitReviewAndRecalculateRating({
        itemId: 'item-1',
        itemCollection: 'items',
        rating: 5,
        comment: '',
        userId: 'partner-123',
      })
    ).rejects.toThrow('Parceiros não podem avaliar seus próprios estabelecimentos ou eventos');
  });
});

describe('FirestoreReviewAdapter — deleteReviewsByUser', () => {
  let adapter: FirestoreReviewAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new FirestoreReviewAdapter();
  });

  it('deve retornar sem erro se o usuário não possui reviews', async () => {
    mocks.adminDb.collection.mockImplementation(((col: string) => ({
      where: vi.fn(() => ({
        get: vi.fn().mockResolvedValue({ empty: true, forEach: () => {} }),
      })),
      doc: (id: string) => mocks.getDocRef(col, id),
    })) as any);

    await expect(adapter.deleteReviewsByUser('user-sem-reviews')).resolves.toBeUndefined();
  });
});
