import { NotificationSettingsPatch } from '../dtos/UpdateNotificationSettingsDTO';

export interface CreateNotificationInput {
  recipientPartnerId: string;
  type: 'review' | 'admin_message' | 'plan_expiring';
  title: string;
  message: string;
  relatedItemId?: string;
  relatedItemCollection?: 'items' | 'events';
  itemCollection?: 'items' | 'events';
}

export interface NotificationRepositoryPort {
  createNotification(input: CreateNotificationInput): Promise<void>;
  createBulkNotifications(
    recipientPartnerIds: string[],
    data: Omit<CreateNotificationInput, 'recipientPartnerId'>
  ): Promise<void>;
  markAsRead(notificationId: string, recipientId: string): Promise<void>;
  markAllAsRead(recipientId: string): Promise<void>;
  isNotificationTypeEnabled(partnerId: string, type: 'review' | 'plan_expiring'): Promise<boolean>;
  getSettings(partnerId: string): Promise<Record<string, unknown>>;
  updateSettings(partnerId: string, settings: NotificationSettingsPatch): Promise<void>;
}
