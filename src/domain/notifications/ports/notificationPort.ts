import { Notification, SendAdminNotificationPayload } from '../types/notification';
import type { NotificationPreferences } from '../types/notificationCategories';

export interface NotificationPort {
  subscribeToNotifications(
    partnerId: string,
    onUpdate: (notifications: Notification[]) => void,
    onError?: (error: Error) => void,
    limitCount?: number
  ): () => void;

  markAsRead(notificationId: string): Promise<void>;
  markAllAsRead(): Promise<void>;

  sendAdminNotification(payload: SendAdminNotificationPayload): Promise<void>;

  /** Preferências da conta logada (D25): push por categoria, silêncio noturno e resumo diário. */
  getPreferences(): Promise<NotificationPreferences>;
  updatePreferences(patch: Partial<NotificationPreferences>): Promise<void>;
}
