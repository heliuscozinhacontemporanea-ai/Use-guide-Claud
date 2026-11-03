import { notificationService } from '../factory';

export function markAllNotificationsAsReadUseCase(recipientUid: string): Promise<void> {
  return notificationService.markAllAsRead(recipientUid);
}
