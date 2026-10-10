import { FirestoreReviewAdapter } from './adapters/firestoreReviewAdapter';
import { ReviewPort } from './ports/reviewPort';

export const reviewAdapter: ReviewPort = new FirestoreReviewAdapter();
