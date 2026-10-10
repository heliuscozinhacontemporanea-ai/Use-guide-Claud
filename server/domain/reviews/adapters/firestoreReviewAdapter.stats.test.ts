import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  aggregateGet: vi.fn(),
  aggregate: vi.fn(),
  collection: vi.fn(),
  fullScanGet: vi.fn(),
  count: vi.fn(() => 'COUNT'),
  average: vi.fn((field: string) => `AVG:${field}`),
}));

vi.mock('../../guide', () => ({}));
vi.mock('../../users', () => ({}));
vi.mock('../../events', () => ({}));

vi.mock('../../../infrastructure/firebase/adminClient', () => ({
  adminDb: { collection: mocks.collection },
}));

vi.mock('firebase-admin/firestore', () => ({
  FieldValue: { serverTimestamp: vi.fn() },
  AggregateField: { count: mocks.count, average: mocks.average },
}));

import { FirestoreReviewAdapter } from './firestoreReviewAdapter';

describe('FirestoreReviewAdapter.getReviewsStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.aggregate.mockReturnValue({ get: mocks.aggregateGet });
    mocks.collection.mockReturnValue({ aggregate: mocks.aggregate, get: mocks.fullScanGet });
  });

  it('calcula total e média por agregação, sem varrer a coleção', async () => {
    mocks.aggregateGet.mockResolvedValue({ data: () => ({ totalReviews: 10, avgRating: 4.5 }) });

    await expect(new FirestoreReviewAdapter().getReviewsStats()).resolves.toEqual({
      totalReviews: 10,
      avgRating: 4.5,
    });

    expect(mocks.aggregate).toHaveBeenCalledWith({
      totalReviews: 'COUNT',
      avgRating: 'AVG:rating',
    });
    expect(mocks.fullScanGet).not.toHaveBeenCalled();
  });

  it('retorna média 0 quando não há avaliações (Firestore devolve null)', async () => {
    mocks.aggregateGet.mockResolvedValue({ data: () => ({ totalReviews: 0, avgRating: null }) });

    await expect(new FirestoreReviewAdapter().getReviewsStats()).resolves.toEqual({
      totalReviews: 0,
      avgRating: 0,
    });
  });
});
