export interface ReviewNotificationContext {
  recipientPartnerId: string;
  itemName: string;
  userName: string;
  rating: number;
  itemId: string;
  itemCollection: 'items' | 'events';
  isUpdate: boolean;
}

export interface ReviewNotificationPort {
  notifyReviewReceived(context: ReviewNotificationContext): Promise<void>;
}
