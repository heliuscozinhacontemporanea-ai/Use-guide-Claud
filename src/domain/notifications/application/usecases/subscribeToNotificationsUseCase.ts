import { z } from 'zod';
import { notificationAdapter } from '../../factory';
import { Notification } from '../../types/notification';

const subscribeSchema = z.object({
  partnerId: z.string().min(1, 'ID do parceiro é obrigatório'),
  limitCount: z.number().int().positive().optional(),
});

export function subscribeToNotificationsUseCase(
  partnerId: string,
  onUpdate: (notifications: Notification[]) => void,
  onError?: (error: Error) => void,
  limitCount?: number
): () => void {
  subscribeSchema.parse({ partnerId, limitCount });
  return notificationAdapter.subscribeToNotifications(partnerId, onUpdate, onError, limitCount);
}
