import { createNotificationUseCase } from '../../notifications';
import type {
  ReviewNotificationContext,
  ReviewNotificationPort,
} from '../ports/reviewNotificationPort';

export class ReviewNotificationAdapter implements ReviewNotificationPort {
  async notifyReviewReceived(context: ReviewNotificationContext): Promise<void> {
    await createNotificationUseCase({
      recipientUid: context.recipientPartnerId,
      type: context.isUpdate ? 'review_updated' : 'review_received',
      params: { user: context.userName, item: context.itemName, rating: context.rating },
      link: { screen: context.itemCollection === 'events' ? 'event' : 'item', id: context.itemId },
    });
  }
}
