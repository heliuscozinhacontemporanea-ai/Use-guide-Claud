import { GuideService } from './services/guideService';
import { FirestoreGuideAdapter } from './adapters/firestoreGuideAdapter';

const guideAdapter = new FirestoreGuideAdapter();
export const guideService = new GuideService(guideAdapter);
