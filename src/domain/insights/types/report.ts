import type { FirestoreReview } from '../../reviews';

export type ReportCollection = 'items' | 'events';

export interface ReportEntity {
  id: string;
  type: ReportCollection;
  name: string;
  image?: string;
  location?: string;
  isVerified?: boolean;
  isVerificationSuspended?: boolean;
}

export type PartnerReview = FirestoreReview;
