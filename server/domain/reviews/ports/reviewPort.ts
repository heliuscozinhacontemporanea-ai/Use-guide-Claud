import { CreateReviewDTO } from '../dtos/CreateReviewDTO';

export interface ReviewSubmissionTarget {
  partnerId: string | null;
  name: string;
}

export interface ReviewSubmissionAuthor {
  name: string;
}

export interface SubmitReviewResult {
  reviewId: string;
  isUpdate: boolean;
  itemId: string;
  itemCollection: 'items' | 'events';
  rating: number;
  target: ReviewSubmissionTarget;
  author: ReviewSubmissionAuthor;
}

export interface ReviewPort {
  submitReviewAndRecalculateRating(dto: CreateReviewDTO): Promise<SubmitReviewResult>;
  respondToReview(
    reviewId: string,
    response: string,
    responderId: string,
    isAdmin?: boolean
  ): Promise<void>;
  deleteReview(reviewId: string, requesterId: string, isAdmin?: boolean): Promise<void>;
  deleteReviewsByUser(userId: string): Promise<void>;
  getReviewsStats(): Promise<{ totalReviews: number; avgRating: number }>;
}
