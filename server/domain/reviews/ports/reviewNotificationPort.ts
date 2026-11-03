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
  /** Avisa quem escreveu a avaliação que o estabelecimento respondeu (D25). */
  notifyReviewReplied(context: {
    authorId: string;
    reviewId: string;
    businessName: string;
  }): Promise<void>;
  /** Avisa quem denunciou que a análise terminou (D25). */
  notifyReportDecided(context: { reporterUid: string; reportId: string }): Promise<void>;
}
