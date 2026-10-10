import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const notificationCollection = {
    doc: vi.fn(),
    where: vi.fn(),
  };

  const adminDb = {
    collection: vi.fn(() => notificationCollection),
    bulkWriter: vi.fn(),
  };

  return {
    adminDb,
    notificationCollection,

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

import { FirebaseAdminNotificationAdapter } from './firebaseAdminNotificationAdapter';

import {
  NotificationForbiddenError,
  NotificationNotFoundError,
} from '../errors/notificationErrors';

describe('FirebaseAdminNotificationAdapter', () => {
  const adapter = new FirebaseAdminNotificationAdapter();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve rejeitar notification inexistente', async () => {
    const get = vi.fn().mockResolvedValue({
      exists: false,
      data: () => undefined,
    });

    const update = vi.fn();

    mocks.notificationCollection.doc.mockReturnValue({
      get,
      update,
    });

    await expect(adapter.markAsRead('notification-1', 'partner-1')).rejects.toBeInstanceOf(
      NotificationNotFoundError
    );

    expect(update).not.toHaveBeenCalled();
  });

  it('deve rejeitar notification de outro parceiro', async () => {
    const get = vi.fn().mockResolvedValue({
      exists: true,
      data: () => ({
        recipientPartnerId: 'partner-2',
      }),
    });

    const update = vi.fn();

    mocks.notificationCollection.doc.mockReturnValue({
      get,
      update,
    });

    await expect(adapter.markAsRead('notification-1', 'partner-1')).rejects.toBeInstanceOf(
      NotificationForbiddenError
    );

    expect(update).not.toHaveBeenCalled();
  });

  it('deve marcar como lida somente a notification do destinatário', async () => {
    const get = vi.fn().mockResolvedValue({
      exists: true,
      data: () => ({
        recipientPartnerId: 'partner-1',
      }),
    });

    const update = vi.fn().mockResolvedValue(undefined);

    mocks.notificationCollection.doc.mockReturnValue({
      get,
      update,
    });

    await adapter.markAsRead('notification-1', 'partner-1');

    expect(update).toHaveBeenCalledWith({
      read: true,
      readAt: 'SERVER_TIMESTAMP',
    });
  });
});
