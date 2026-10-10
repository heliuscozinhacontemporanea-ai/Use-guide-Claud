import { InsightsAdapter } from './adapters/InsightsAdapter';
import { InsightsPort } from './ports/insightsPort';

export const insightsAdapter: InsightsPort = new InsightsAdapter();
