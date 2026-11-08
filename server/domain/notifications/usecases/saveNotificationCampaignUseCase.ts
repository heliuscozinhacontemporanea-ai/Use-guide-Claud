import { notificationCampaigns } from '../factory';
import type { NotificationCampaign } from '../ports/notificationCampaignPort';

export function saveNotificationCampaignUseCase(campaign: NotificationCampaign): Promise<void> {
  return notificationCampaigns.save(campaign);
}
