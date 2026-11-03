import { notificationAdapter } from '../../factory';
import type { NotificationPreferences } from '../../types/notificationCategories';

export function getNotificationPreferencesUseCase(): Promise<NotificationPreferences> {
  return notificationAdapter.getPreferences();
}
