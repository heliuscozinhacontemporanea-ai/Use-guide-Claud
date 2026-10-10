import { FavoriteItem, FavoriteItemDetails } from '../types/favorite';

export interface FavoritesPort {
  addFavorite(
    userId: string,
    itemId: string,
    itemCollection: 'items' | 'events',
    itemTypeLabel?: string,
    partnerId?: string,
    itemDetails?: FavoriteItemDetails
  ): Promise<void>;
  removeFavorite(userId: string, itemId: string, itemCollection: 'items' | 'events'): Promise<void>;
  getUserFavorites(userId: string): Promise<FavoriteItem[]>;
  subscribeUserFavorites(
    userId: string,
    onUpdate: (favorites: FavoriteItem[]) => void,
    onError?: (error: Error) => void
  ): () => void;
}
