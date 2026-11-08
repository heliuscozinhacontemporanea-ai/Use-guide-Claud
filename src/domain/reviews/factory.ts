import { FirestoreReviewAdapter } from './adapters/firestoreReviewAdapter';
import { HttpReviewReportAdapter } from './adapters/httpReviewReportAdapter';
import type { ReviewPort } from './ports/reviewPort';
import type { ReviewReportApiPort } from './ports/reviewReportApiPort';

export const reviewAdapter: ReviewPort = new FirestoreReviewAdapter();
export const reviewReportApi: ReviewReportApiPort = new HttpReviewReportAdapter();
