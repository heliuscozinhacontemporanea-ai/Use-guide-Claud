import type { NewNotification, NotificationPreferences } from '../types/notificationTypes';

export interface NotificationRepositoryPort {
  /** Falso quando o `dedupeKey` já existe. */
  create(notification: NewNotification, expiresAt: Date): Promise<boolean>;
  createMany(
    recipientUids: string[],
    data: Omit<NewNotification, 'recipientUid' | 'dedupeKey'>,
    expiresAt: Date
  ): Promise<void>;
  /** Falso quando o aviso não existe ou é de outra pessoa. */
  markAsRead(notificationId: string, recipientUid: string): Promise<boolean>;
  markAllAsRead(recipientUid: string): Promise<void>;
  getPreferences(uid: string): Promise<Partial<NotificationPreferences> | null>;
  savePreferences(uid: string, preferences: NotificationPreferences): Promise<void>;
  deleteAllForUser(uid: string): Promise<void>;
}
