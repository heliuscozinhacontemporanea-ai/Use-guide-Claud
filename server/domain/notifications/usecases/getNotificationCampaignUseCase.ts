import { notificationCampaigns } from '../factory';
import type { NotificationCampaign } from '../ports/notificationCampaignPort';

export function getNotificationCampaignUseCase(id: string): Promise<NotificationCampaign | null> {
  return notificationCampaigns.get(id);
}
