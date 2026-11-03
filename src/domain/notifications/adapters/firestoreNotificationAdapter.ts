import { firebaseApiFetch } from '../../../shared/infrastructure/firebase/firebaseApiFetch';
import { subscribeToCollectionUseCase } from '../../database';
import { NotificationPort } from '../ports/notificationPort';
import type { SendAdminNotificationPayload, StoredNotification } from '../types/notification';
import type { NotificationPreferences } from '../types/notificationCategories';

export class FirestoreNotificationAdapter implements NotificationPort {
  subscribeToNotifications(
    uid: string,
    onUpdate: (notifications: StoredNotification[]) => void,
    onError?: (error: Error) => void,
    limitCount?: number
  ): () => void {
    return subscribeToCollectionUseCase<StoredNotification>(
      'notifications',
      onUpdate,
      onError,
      [{ field: 'recipientUid', op: '==', value: uid }],
      [{ field: 'createdAt', direction: 'desc' }],
      limitCount
    );
  }

  async markAsRead(notificationId: string): Promise<void> {
    const res = await firebaseApiFetch(
      `/api/notifications/${encodeURIComponent(notificationId)}/read`,
      { method: 'PATCH' },
      { requireAuth: true }
    );
    if (!res.ok) throw new Error('NOTIFICATION_UPDATE_FAILED');
  }

  async markAllAsRead(): Promise<void> {
    const res = await firebaseApiFetch(
      '/api/notifications/read-all',
      { method: 'PATCH' },
      { requireAuth: true }
    );
    if (!res.ok) throw new Error('NOTIFICATION_UPDATE_FAILED');
  }

  async sendAdminNotification(payload: SendAdminNotificationPayload): Promise<void> {
    const res = await firebaseApiFetch(
      '/api/admin/notifications',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
      { requireAuth: true }
    );
    if (!res.ok) throw new Error('ADMIN_MESSAGE_FAILED');
  }

  async getPreferences(): Promise<NotificationPreferences> {
    const res = await firebaseApiFetch(
      '/api/notifications/preferences',
      { method: 'GET' },
      { requireAuth: true }
    );
    if (!res.ok) throw new Error('PREFERENCES_UNAVAILABLE');
    const body = (await res.json()) as { data: NotificationPreferences };
    return body.data;
  }

  async updatePreferences(patch: Partial<NotificationPreferences>): Promise<void> {
    const res = await firebaseApiFetch(
      '/api/notifications/preferences',
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      },
      { requireAuth: true }
    );
    if (!res.ok) throw new Error('PREFERENCES_SAVE_FAILED');
  }
}
