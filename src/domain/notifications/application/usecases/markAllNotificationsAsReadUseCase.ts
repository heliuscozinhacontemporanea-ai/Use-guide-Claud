import { notificationAdapter } from '../../factory';

export async function markAllNotificationsAsReadUseCase(): Promise<void> {
  await notificationAdapter.markAllAsRead();
}
