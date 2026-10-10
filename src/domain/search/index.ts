// Contratos e tipos públicos do domínio de Busca
export type {
  CategoryFilter,
  FilterBarProps,
  SearchOverlayProps,
  SearchFilterState,
} from './types/search';

// Constantes públicas do domínio de Busca
export { REGIONS, CATEGORY_FILTERS, PLACEHOLDER_PHRASES } from './constants/filterOptions';

// Portas e Adaptadores do domínio de Busca
export type { SearchPort } from './ports/searchPort';
export { searchAdapter } from './factory';

// Use Cases públicos do domínio de Busca
export { filterItemsUseCase } from './application/usecases/filterItemsUseCase';

// Hooks públicos do domínio de Busca
export { useSearch, filterItemsList } from './hooks/useSearch';
export { useFilters } from './hooks/useFilters';
export { useDynamicSuggestions } from './hooks/useDynamicSuggestions';

// Componentes públicos do domínio de Busca
export { FilterBar } from './components/FilterBar';
export { SearchOverlay } from './components/SearchOverlay';
