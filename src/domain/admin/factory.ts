import { HttpAdminListingAdapter } from './adapters/httpAdminListingAdapter';
import { FirestoreAdminPlansAdapter } from './adapters/firestoreAdminPlansAdapter';
import { HttpAdminReportsAdapter } from './adapters/httpAdminReportsAdapter';
import type { AdminListingPort } from './ports/adminListingPort';
import type { AdminPlansPort } from './ports/adminPlansPort';
import type { AdminReportsPort } from './ports/adminReportsPort';

export const adminPlansAdapter: AdminPlansPort = new FirestoreAdminPlansAdapter();
export const adminReportsAdapter: AdminReportsPort = new HttpAdminReportsAdapter();
export const adminListingAdapter: AdminListingPort = new HttpAdminListingAdapter();
