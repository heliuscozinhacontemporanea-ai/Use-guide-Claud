import { notificationAdapter } from '../../factory';
import type { NotificationPreferences } from '../../types/notificationCategories';

export function updateNotificationPreferencesUseCase(
  patch: Partial<NotificationPreferences>
): Promise<void> {
  return notificationAdapter.updatePreferences(patch);
}
