import { notificationService } from '../factory';
import type { NewNotification } from '../types/notificationTypes';

/** Mesmo aviso traduzido para muitas contas; devolve quantas receberam. */
export function broadcastNotificationUseCase(
  recipientUids: string[],
  data: Pick<NewNotification, 'type' | 'params' | 'link'>
): Promise<number> {
  return notificationService.broadcast(recipientUids, data);
}
