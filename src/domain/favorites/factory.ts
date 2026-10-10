import { FavoritesPort } from './ports/favoritesPort';
import { FavoritesAdapter } from './adapters/FavoritesAdapter';

export const favoritesAdapter: FavoritesPort = new FavoritesAdapter();
