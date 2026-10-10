import { FirebaseAdminInsightsAdapter } from './adapters/firebaseAdminInsightsAdapter';
import { InsightsService } from './services/insightsService';

const repoAdapter = new FirebaseAdminInsightsAdapter();
export const insightsService = new InsightsService(repoAdapter);
