import { notificationService } from '../factory';
import { CreateNotificationInput } from '../ports/notificationRepositoryPort';

export async function createNotificationUseCase(input: CreateNotificationInput): Promise<boolean> {
  return notificationService.createNotification(input);
}
