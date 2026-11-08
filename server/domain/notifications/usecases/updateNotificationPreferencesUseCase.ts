import { notificationService } from '../factory';
import type { NotificationPreferences } from '../types/notificationTypes';

export function updateNotificationPreferencesUseCase(
  uid: string,
  patch: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
  return notificationService.updatePreferences(uid, patch);
}
