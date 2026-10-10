import { favoritesAdapter } from '../../factory';
import type { FavoriteItemDetails } from '../../types/favorite';

export async function addFavoriteUseCase(
  userId: string,
  itemId: string,
  itemCollection: 'items' | 'events',
  itemTypeLabel?: string,
  partnerId?: string,
  itemDetails?: FavoriteItemDetails
): Promise<void> {
  return favoritesAdapter.addFavorite(
    userId,
    itemId,
    itemCollection,
    itemTypeLabel,
    partnerId,
    itemDetails
  );
}
