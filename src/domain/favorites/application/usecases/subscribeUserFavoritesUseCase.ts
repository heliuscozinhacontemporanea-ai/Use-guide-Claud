import { favoritesAdapter } from '../../factory';
import type { FavoriteItem } from '../../types/favorite';

export function subscribeUserFavoritesUseCase(
  userId: string,
  onUpdate: (favorites: FavoriteItem[]) => void,
  onError?: (error: Error) => void
): () => void {
  return favoritesAdapter.subscribeUserFavorites(userId, onUpdate, onError);
}
