import { z } from 'zod';
import { notificationAdapter } from '../../factory';
import { NotificationSettings } from '../../types/notification';

const updateSettingsSchema = z.object({
  partnerId: z.string().min(1, 'ID do parceiro é obrigatório'),
  settings: z.object({
    reviewNotifications: z.boolean().optional(),
    planExpiringNotifications: z.boolean().optional(),
  }),
});

export async function updateNotificationSettingsUseCase(
  partnerId: string,
  settings: Partial<Omit<NotificationSettings, 'partnerId'>>
): Promise<void> {
  updateSettingsSchema.parse({ partnerId, settings });
  await notificationAdapter.updateSettings(partnerId, settings);
}
