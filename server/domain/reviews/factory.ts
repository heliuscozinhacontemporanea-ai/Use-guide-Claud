import { FirestoreReviewAdapter } from './adapters/firestoreReviewAdapter';
import { FirestoreReviewReportAdapter } from './adapters/firestoreReviewReportAdapter';
import { ReviewNotificationAdapter } from './adapters/reviewNotificationAdapter';
import { ReviewReportService } from './services/reviewReportService';
import { ReviewService } from './services/reviewService';

const reviewAdapter = new FirestoreReviewAdapter();
const reviewNotificationAdapter = new ReviewNotificationAdapter();

export const reviewService = new ReviewService(reviewAdapter, reviewNotificationAdapter);
export const reviewReportService = new ReviewReportService(new FirestoreReviewReportAdapter());
