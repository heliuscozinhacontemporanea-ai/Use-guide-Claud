import {
  Notification,
  NotificationSettings,
  SendAdminNotificationPayload,
} from '../types/notification';

export interface NotificationPort {
  subscribeToNotifications(
    partnerId: string,
    onUpdate: (notifications: Notification[]) => void,
    onError?: (error: Error) => void,
    limitCount?: number
  ): () => void;

  markAsRead(notificationId: string): Promise<void>;
  markAllAsRead(): Promise<void>;

  getSettings(partnerId: string): Promise<NotificationSettings>;
  updateSettings(
    partnerId: string,
    settings: Partial<Omit<NotificationSettings, 'partnerId'>>
  ): Promise<void>;

  sendAdminNotification(payload: SendAdminNotificationPayload): Promise<void>;
}
