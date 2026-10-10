import { favoritesAdapter } from '../../factory';

export async function removeFavoriteUseCase(
  userId: string,
  itemId: string,
  itemCollection: 'items' | 'events'
): Promise<void> {
  return favoritesAdapter.removeFavorite(userId, itemId, itemCollection);
}
