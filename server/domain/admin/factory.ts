import { FirestoreAdminPlansAdapter } from './adapters/firestoreAdminPlansAdapter';
import { AdminPlansService } from './services/adminPlansService';

const adminPlansAdapter = new FirestoreAdminPlansAdapter();
export const adminPlansService = new AdminPlansService(adminPlansAdapter);
