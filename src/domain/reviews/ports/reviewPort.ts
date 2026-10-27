import { FirestoreReview, ReviewSortOption } from '../types/review';
import { DatabaseCursor, DatabasePage } from '../../database/ports/databasePort';

export interface ReviewPort {
  getReviews(
    itemId: string,
    itemCollection: 'items' | 'events',
    limitCount: number,
    sortBy: ReviewSortOption,
    cursor?: DatabaseCursor | null
  ): Promise<DatabasePage<FirestoreReview>>;

  subscribeToReviews(
    itemId: string,
    itemCollection: 'items' | 'events',
    limitCount: number,
    sortBy: ReviewSortOption,
    onUpdate: (reviews: FirestoreReview[]) => void,
    onError?: (error: Error) => void
  ): () => void;

  getUserReview(
    itemId: string,
    itemCollection: 'items' | 'events',
    userId: string,
    occurrenceId?: string
  ): Promise<FirestoreReview | null>;

  getAllReviews(): Promise<FirestoreReview[]>;

  submitReview(
    itemId: string,
    itemCollection: 'items' | 'events',
    rating: number,
    comment: string,
    options?: { occurrenceId?: string; ticketId?: string }
  ): Promise<void>;

  respondToReview(reviewId: string, partnerResponse: string): Promise<void>;

  listUserReviews(
    userId: string,
    limitCount: number,
    cursor?: DatabaseCursor | null
  ): Promise<DatabasePage<FirestoreReview>>;

  deleteReview(reviewId: string): Promise<void>;
}
