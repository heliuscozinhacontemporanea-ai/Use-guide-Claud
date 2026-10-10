import { z } from 'zod';
import { notificationAdapter } from '../../factory';

const markAsReadSchema = z.object({
  notificationId: z.string().min(1, 'ID da notificação é obrigatório'),
});

export async function markNotificationAsReadUseCase(notificationId: string): Promise<void> {
  markAsReadSchema.parse({ notificationId });
  await notificationAdapter.markAsRead(notificationId);
}
