import { z } from 'zod';
import { notificationAdapter } from '../../factory';
import { NotificationSettings } from '../../types/notification';

const getSettingsSchema = z.object({
  partnerId: z.string().min(1, 'ID do parceiro é obrigatório'),
});

export async function getNotificationSettingsUseCase(
  partnerId: string
): Promise<NotificationSettings> {
  getSettingsSchema.parse({ partnerId });
  return notificationAdapter.getSettings(partnerId);
}
