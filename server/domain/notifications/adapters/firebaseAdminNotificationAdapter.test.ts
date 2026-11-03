import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const doc = { get: vi.fn(), update: vi.fn(), create: vi.fn(), set: vi.fn() };
  const collection = { doc: vi.fn(() => doc), where: vi.fn() };
  return {
    doc,
    collection,
    adminDb: { collection: vi.fn(() => collection), bulkWriter: vi.fn() },
  };
});

vi.mock('../../../infrastructure/firebase/adminClient', () => ({ adminDb: mocks.adminDb }));
vi.mock('firebase-admin/firestore', () => ({
  FieldValue: { serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP') },
  Timestamp: { fromDate: vi.fn((date: Date) => ({ date })) },
}));

import { FirebaseAdminNotificationAdapter } from './firebaseAdminNotificationAdapter';

describe('FirebaseAdminNotificationAdapter', () => {
  const adapter = new FirebaseAdminNotificationAdapter();
  const expiresAt = new Date('2027-02-01T00:00:00.000Z');

  beforeEach(() => vi.clearAllMocks());

  it('não altera aviso de outra pessoa', async () => {
    mocks.doc.get.mockResolvedValue({ exists: true, get: () => 'dono' });
    expect(await adapter.markAsRead('n1', 'intruso')).toBe(false);
    expect(mocks.doc.update).not.toHaveBeenCalled();
  });

  it('grava só os campos do aviso e não repete o mesmo dedupeKey', async () => {
    mocks.doc.create.mockResolvedValueOnce(undefined);
    expect(
      await adapter.create(
        { recipientUid: 'u1', type: 'plan_expiring', params: { days: 3 }, dedupeKey: 'k1' },
        expiresAt
      )
    ).toBe(true);
    expect(mocks.collection.doc).toHaveBeenCalledWith('k1');
    expect(mocks.doc.create).toHaveBeenCalledWith({
      recipientUid: 'u1',
      type: 'plan_expiring',
      params: { days: 3 },
      link: null,
      read: false,
      createdAt: 'SERVER_TIMESTAMP',
      expiresAt: { date: expiresAt },
    });

    mocks.doc.create.mockRejectedValueOnce(Object.assign(new Error('exists'), { code: 6 }));
    expect(
      await adapter.create(
        { recipientUid: 'u1', type: 'plan_expiring', dedupeKey: 'k1' },
        expiresAt
      )
    ).toBe(false);
  });
});
