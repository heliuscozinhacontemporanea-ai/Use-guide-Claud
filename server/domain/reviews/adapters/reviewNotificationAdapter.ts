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

  async notifyReviewReplied(context: {
    authorId: string;
    reviewId: string;
    businessName: string;
  }): Promise<void> {
    await createNotificationUseCase({
      recipientUid: context.authorId,
      type: 'review_reply_received',
      params: { business: context.businessName },
      link: { screen: 'reviews' },
      dedupeKey: `review_reply_${context.reviewId}`,
    });
  }

  async notifyReportDecided(context: { reporterUid: string; reportId: string }): Promise<void> {
    await createNotificationUseCase({
      recipientUid: context.reporterUid,
      type: 'review_report_decided',
      link: { screen: 'reviews' },
      dedupeKey: `review_report_decided_${context.reportId}`,
    });
  }
}
