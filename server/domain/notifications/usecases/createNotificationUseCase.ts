import { notificationService } from '../factory';
import type { NewNotification } from '../types/notificationTypes';

/** Grava um aviso. Falso quando o mesmo aviso (`dedupeKey`) já existe. */
export function createNotificationUseCase(notification: NewNotification): Promise<boolean> {
  return notificationService.create(notification);
}
