import { z } from 'zod';
import { notificationAdapter } from '../../factory';
import { SendAdminNotificationPayload } from '../../types/notification';

const sendAdminInputSchema = z.object({
  recipientIds: z.union([z.array(z.string().min(1)), z.literal('all')]),
  title: z.string().min(1, 'Título é obrigatório'),
  message: z.string().min(1, 'Mensagem é obrigatória'),
});

export type SendAdminInput = SendAdminNotificationPayload;

export async function sendAdminNotificationUseCase(input: SendAdminInput): Promise<void> {
  const validated = sendAdminInputSchema.parse(input);
  return notificationAdapter.sendAdminNotification(validated);
}
