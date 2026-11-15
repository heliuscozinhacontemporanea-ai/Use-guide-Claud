export { addFavoriteUseCase } from './application/usecases/addFavoriteUseCase';
export { removeFavoriteUseCase } from './application/usecases/removeFavoriteUseCase';
export { subscribeUserFavoritesUseCase } from './application/usecases/subscribeUserFavoritesUseCase';
// Componentes públicos apenas para src/app/compositions (AGENTS.md §5.2 item 5).
export { FavoriteButton } from './components/FavoriteButton';
export { FavoritesList } from './components/FavoritesList';
export { useFavorites } from './hooks/useFavorites';
export type { FavoriteItem, FavoriteItemDetails } from './types/favorite';
