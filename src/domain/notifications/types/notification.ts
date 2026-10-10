export interface TimestampLike {
  seconds?: number;
  nanoseconds?: number;
  toDate?: () => Date;
}

export type NotificationDate = string | number | Date | TimestampLike | null;

export interface Notification {
  id: string;
  recipientPartnerId: string;
  type: 'review' | 'admin_message' | 'plan_expiring';
  title: string;
  message: string;
  relatedItemId?: string;
  relatedItemCollection?: 'items' | 'events' | null;
  read: boolean;
  createdAt: NotificationDate;
  expiresAt: NotificationDate;
}

export interface SendAdminNotificationPayload {
  recipientIds: string[] | 'all';
  title: string;
  message: string;
}

export interface NotificationSettings {
  partnerId: string;
  reviewNotifications: boolean;
  planExpiringNotifications: boolean;
}
