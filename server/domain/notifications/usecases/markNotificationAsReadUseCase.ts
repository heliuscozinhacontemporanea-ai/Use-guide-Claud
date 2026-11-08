import { notificationService } from '../factory';

export function markNotificationAsReadUseCase(
  notificationId: string,
  recipientUid: string
): Promise<void> {
  return notificationService.markAsRead(notificationId, recipientUid);
}
