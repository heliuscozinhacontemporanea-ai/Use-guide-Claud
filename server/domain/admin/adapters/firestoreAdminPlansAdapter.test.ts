import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminDomainError } from '../errors/adminDomainError';
import { FirestoreAdminPlansAdapter } from './firestoreAdminPlansAdapter';

const mocks = vi.hoisted(() => ({
  update: vi.fn(),
  getDoc: vi.fn(),
  getCollection: vi.fn(),
  doc: vi.fn(),
  collection: vi.fn(),
  serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP'),
}));

vi.mock('firebase-admin/firestore', () => ({
  FieldValue: {
    serverTimestamp: mocks.serverTimestamp,
  },
}));

vi.mock('../../../infrastructure/firebase/adminClient', () => ({
  adminDb: {
    collection: mocks.collection,
  },
}));

describe('FirestoreAdminPlansAdapter', () => {
  let adapter: FirestoreAdminPlansAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.doc.mockReturnValue({
      update: mocks.update,
      get: mocks.getDoc,
    });
    mocks.collection.mockReturnValue({
      doc: mocks.doc,
      get: mocks.getCollection,
    });
    adapter = new FirestoreAdminPlansAdapter();
  });

  it('usa update real e não persiste id no payload', async () => {
    mocks.update.mockResolvedValue(undefined);

    await adapter.updatePlan('monthly', {
      name: 'Plano Mensal',
      price: 59.9,
      description: 'Descrição atualizada',
      isActive: true,
    });

    expect(mocks.collection).toHaveBeenCalledWith('subscriptionPlans');
    expect(mocks.doc).toHaveBeenCalledWith('monthly');
    expect(mocks.update).toHaveBeenCalledWith({
      name: 'Plano Mensal',
      price: 59.9,
      description: 'Descrição atualizada',
      isActive: true,
      updatedAt: 'SERVER_TIMESTAMP',
    });
  });

  it('lança NOT_FOUND quando documento não existe no Firestore', async () => {
    mocks.update.mockRejectedValue({ code: 5 });

    await expect(
      adapter.updatePlan('inexistente', { name: 'Teste' })
    ).rejects.toMatchObject({
      code: 'NOT_FOUND',
      name: 'AdminDomainError',
    });
  });

  it('lança INVALID_ID quando planId é vazio', async () => {
    await expect(
      adapter.updatePlan('   ', { name: 'Teste' })
    ).rejects.toThrow(AdminDomainError);
    expect(mocks.update).not.toHaveBeenCalled();
  });
});
