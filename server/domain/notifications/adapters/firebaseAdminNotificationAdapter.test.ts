import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const doc = { id: 'k1', get: vi.fn(), update: vi.fn(), set: vi.fn() };
  const collection = { doc: vi.fn(() => doc), where: vi.fn() };
  const batch = { create: vi.fn(), commit: vi.fn() };
  return {
    doc,
    collection,
    batch,
    adminDb: {
      collection: vi.fn(() => collection),
      bulkWriter: vi.fn(),
      batch: vi.fn(() => batch),
    },
  };
});

vi.mock('../../../infrastructure/firebase/adminClient', () => ({ adminDb: mocks.adminDb }));
vi.mock('firebase-admin/firestore', () => ({
  FieldValue: { serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP') },
  Timestamp: { fromDate: vi.fn((date: Date) => ({ date })), now: vi.fn(() => 'NOW') },
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

  it('grava o aviso e a entrada do push juntos, e não repete o mesmo dedupeKey', async () => {
    mocks.batch.commit.mockResolvedValueOnce(undefined);
    expect(
      await adapter.create(
        { recipientUid: 'u1', type: 'plan_expiring', params: { days: 3 }, dedupeKey: 'k1' },
        expiresAt
      )
    ).toBe(true);
    expect(mocks.collection.doc).toHaveBeenCalledWith('k1');
    expect(mocks.batch.create).toHaveBeenCalledWith(mocks.doc, {
      recipientUid: 'u1',
      type: 'plan_expiring',
      params: { days: 3 },
      link: null,
      read: false,
      createdAt: 'SERVER_TIMESTAMP',
      expiresAt: { date: expiresAt },
    });
    expect(mocks.batch.create).toHaveBeenCalledWith(
      mocks.doc,
      expect.objectContaining({ type: 'plan_expiring', attempts: 0, notBefore: 'NOW' })
    );

    mocks.batch.commit.mockRejectedValueOnce(Object.assign(new Error('exists'), { code: 6 }));
    expect(
      await adapter.create(
        { recipientUid: 'u1', type: 'plan_expiring', dedupeKey: 'k1' },
        expiresAt
      )
    ).toBe(false);
  });
});
