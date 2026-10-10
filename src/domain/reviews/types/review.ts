export type ReviewSortOption = 'recent' | 'highest' | 'lowest';

export type ReviewDateValue = Date | string | number | null | undefined;

export interface Review {
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export interface FirestoreReview {
  id: string;
  itemId: string;
  itemCollection: 'items' | 'events';
  occurrenceId?: string;
  ticketId?: string;
  verifiedAttendance?: boolean;
  userId: string;
  userName: string;
  userPhoto?: string | null;
  rating: number;
  comment: string;
  createdAt: ReviewDateValue;
  updatedAt?: ReviewDateValue;
  partnerId?: string | null;
  partnerResponse?: string | null;
  respondedAt?: ReviewDateValue;
}
