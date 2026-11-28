// Contratos e tipos públicos do domínio de Busca
export type { SearchOverlayProps } from './types/search';

// Constantes públicas do domínio de Busca
export { REGIONS } from './constants/filterOptions';

// Hooks públicos do domínio de Busca
export { useSearch, filterItemsList } from './hooks/useSearch';
export { useDynamicSuggestions } from './hooks/useDynamicSuggestions';

// Componentes públicos do domínio de Busca
export { SearchOverlay } from './components/SearchOverlay';
