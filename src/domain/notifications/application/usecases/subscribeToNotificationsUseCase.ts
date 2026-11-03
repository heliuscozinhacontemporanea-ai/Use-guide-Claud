import { notificationAdapter } from '../../factory';
import type { StoredNotification } from '../../types/notification';

export function subscribeToNotificationsUseCase(
  uid: string,
  onUpdate: (notifications: StoredNotification[]) => void,
  onError?: (error: Error) => void,
  limitCount?: number
): () => void {
  return notificationAdapter.subscribeToNotifications(uid, onUpdate, onError, limitCount);
}
