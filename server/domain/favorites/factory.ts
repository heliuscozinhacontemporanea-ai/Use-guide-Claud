import { FirestoreFavoritesAdapter } from './adapters/firestoreFavoritesAdapter';
import { FavoriteService } from './services/favoriteService';

const firestoreFavoritesAdapter = new FirestoreFavoritesAdapter();
export const favoriteService = new FavoriteService(firestoreFavoritesAdapter);
