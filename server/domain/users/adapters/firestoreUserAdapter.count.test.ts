import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  countGet: vi.fn(),
  count: vi.fn(),
  collection: vi.fn(),
  fullScanGet: vi.fn(),
}));

vi.mock('../../../infrastructure/firebase/adminClient', () => ({
  adminDb: { collection: mocks.collection },
  adminAuth: {},
  adminStorage: {},
}));

vi.mock('firebase-admin/firestore', () => ({
  FieldValue: { serverTimestamp: vi.fn() },
}));

import { FirestoreUserAdapter } from './firestoreUserAdapter';

describe('FirestoreUserAdapter.getUsersCount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.count.mockReturnValue({ get: mocks.countGet });
    mocks.collection.mockReturnValue({ count: mocks.count, get: mocks.fullScanGet });
  });

  it('conta via agregação do Firestore sem ler os documentos', async () => {
    mocks.countGet.mockResolvedValue({ data: () => ({ count: 42 }) });

    await expect(new FirestoreUserAdapter().getUsersCount()).resolves.toBe(42);

    expect(mocks.collection).toHaveBeenCalledWith('users');
    expect(mocks.fullScanGet).not.toHaveBeenCalled();
  });
});
