import { notificationService } from '../factory';
import type { NotificationPreferences } from '../types/notificationTypes';

export function getNotificationPreferencesUseCase(uid: string): Promise<NotificationPreferences> {
  return notificationService.getPreferences(uid);
}
