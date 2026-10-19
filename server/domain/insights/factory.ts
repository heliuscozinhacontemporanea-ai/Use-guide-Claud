import { FirebaseAdminInsightsAdapter } from './adapters/firebaseAdminInsightsAdapter';
import { HmacViewerKeyAdapter } from './adapters/hmacViewerKeyAdapter';
import { InsightsService } from './services/insightsService';

export const insightsService = new InsightsService(
  new FirebaseAdminInsightsAdapter(),
  new HmacViewerKeyAdapter()
);
