import { firebaseApiFetch } from '../../../shared/infrastructure/firebase/firebaseApiFetch';
import { subscribeToCollectionUseCase } from '../../database';
import { NotificationPort } from '../ports/notificationPort';
import { Notification, SendAdminNotificationPayload } from '../types/notification';
import type { NotificationPreferences } from '../types/notificationCategories';

export class FirestoreNotificationAdapter implements NotificationPort {
  subscribeToNotifications(
    partnerId: string,
    onUpdate: (notifications: Notification[]) => void,
    onError?: (error: Error) => void,
    limitCount?: number
  ): () => void {
    return subscribeToCollectionUseCase<Notification>(
      'notifications',
      onUpdate,
      onError,
      [{ field: 'recipientPartnerId', op: '==', value: partnerId }],
      [{ field: 'createdAt', direction: 'desc' }],
      limitCount
    );
  }

  async markAsRead(notificationId: string): Promise<void> {
    const res = await firebaseApiFetch(
      `/api/notifications/${notificationId}/read`,
      {
        method: 'PATCH',
      },
      { requireAuth: true }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro ao marcar notificação como lida');
    }
  }

  async markAllAsRead(): Promise<void> {
    const res = await firebaseApiFetch(
      '/api/notifications/read-all',
      {
        method: 'PATCH',
      },
      { requireAuth: true }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro ao marcar todas as notificações como lidas');
    }
  }

  async sendAdminNotification(payload: SendAdminNotificationPayload): Promise<void> {
    const res = await firebaseApiFetch(
      '/api/notifications/send-admin',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
      { requireAuth: true }
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Erro ao enviar notificação de administrador');
    }
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
