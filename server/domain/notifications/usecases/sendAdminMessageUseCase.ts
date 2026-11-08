import { notificationService } from '../factory';

export function sendAdminMessageUseCase(
  recipientUids: string[],
  title: string,
  message: string
): Promise<void> {
  return notificationService.sendAdminMessage(recipientUids, title, message);
}
