import { PartnerService } from './services/partnerService';
import { FirestorePartnerAdapter } from './adapters/firestorePartnerAdapter';

const partnerAdapter = new FirestorePartnerAdapter();

export const partnerService = new PartnerService(partnerAdapter);
