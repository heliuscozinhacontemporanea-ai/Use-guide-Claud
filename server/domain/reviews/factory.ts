import { ReviewService } from './services/reviewService';
import { FirestoreReviewAdapter } from './adapters/firestoreReviewAdapter';
import { ReviewNotificationAdapter } from './adapters/reviewNotificationAdapter';

const reviewAdapter = new FirestoreReviewAdapter();
const reviewNotificationAdapter = new ReviewNotificationAdapter();

export const reviewService = new ReviewService(reviewAdapter, reviewNotificationAdapter);
