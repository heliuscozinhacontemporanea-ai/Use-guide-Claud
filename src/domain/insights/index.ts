// Contratos e tipos públicos do domínio de Insights
export type { InteractionType, InteractionHistoryItem, ItemStats } from './types/interaction';

// Use Cases públicos do domínio de Insights
export { trackInteractionUseCase } from './application/usecases/trackInteractionUseCase';
export { getItemStatsUseCase } from './application/usecases/getItemStatsUseCase';

// Hooks públicos do domínio de Insights
export { useTrackInteraction } from './hooks/useTrackInteraction';
export { useItemStats } from './hooks/useItemStats';

// Componentes públicos do domínio de Insights
export { ReportsView } from './components/ReportsView';
