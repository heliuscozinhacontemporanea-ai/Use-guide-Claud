import type { SendAdminNotificationPayload, StoredNotification } from '../types/notification';
import type { NotificationPreferences } from '../types/notificationCategories';

export interface NotificationPort {
  /** Avisos da própria conta, mais novos primeiro (leitura direta permitida pelas rules, §6.2). */
  subscribeToNotifications(
    uid: string,
    onUpdate: (notifications: StoredNotification[]) => void,
    onError?: (error: Error) => void,
    limitCount?: number
  ): () => void;

  markAsRead(notificationId: string): Promise<void>;
  markAllAsRead(): Promise<void>;

  sendAdminNotification(payload: SendAdminNotificationPayload): Promise<void>;

  /** Escolhas da conta logada (D25): pedidos de avaliação, novidades e avisos de venda. */
  getPreferences(): Promise<NotificationPreferences>;
  updatePreferences(patch: Partial<NotificationPreferences>): Promise<void>;

  /** Liga ou desliga o push deste aparelho para a conta logada. */
  registerDevice(token: string, locale: string): Promise<void>;
  unregisterDevice(token: string): Promise<void>;
}
