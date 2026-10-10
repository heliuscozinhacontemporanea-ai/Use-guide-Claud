import { getDocumentUseCase, subscribeToCollectionUseCase } from '../../database';
import { NotificationPort } from '../ports/notificationPort';
import {
  Notification,
  NotificationSettings,
  SendAdminNotificationPayload,
} from '../types/notification';
import { firebaseApiFetch } from '../../../shared/infrastructure/firebase/firebaseApiFetch';

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

  async getSettings(partnerId: string): Promise<NotificationSettings> {
    const doc = await getDocumentUseCase<NotificationSettings>(
      'partnerNotificationSettings',
      partnerId
    );
    return (
      doc || {
        partnerId,
        reviewNotifications: true,
        planExpiringNotifications: true,
      }
    );
  }

  async updateSettings(
    _partnerId: string,
    settings: Partial<Omit<NotificationSettings, 'partnerId'>>
  ): Promise<void> {
    const res = await firebaseApiFetch(
      '/api/notifications/settings',
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      },
      { requireAuth: true }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro ao salvar configurações de notificação');
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
}
