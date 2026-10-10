import { FirestoreAdminPlansAdapter } from './adapters/firestoreAdminPlansAdapter';
import { HttpAdminReportsAdapter } from './adapters/httpAdminReportsAdapter';
import type { AdminPlansPort } from './ports/adminPlansPort';
import type { AdminReportsPort } from './ports/adminReportsPort';

export const adminPlansAdapter: AdminPlansPort = new FirestoreAdminPlansAdapter();
export const adminReportsAdapter: AdminReportsPort = new HttpAdminReportsAdapter();
