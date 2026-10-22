import { GuideService } from './services/guideService';
import { FirestoreFeaturedListingsAdapter } from './adapters/firestoreFeaturedListingsAdapter';
import { FirestoreGuideAdapter } from './adapters/firestoreGuideAdapter';

const guideAdapter = new FirestoreGuideAdapter();
export const guideService = new GuideService(guideAdapter);
export const featuredListingsRepository = new FirestoreFeaturedListingsAdapter();
