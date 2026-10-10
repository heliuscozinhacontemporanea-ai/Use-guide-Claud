export interface FavoriteDocument {
  userId: string;
  itemId: string;
  itemCollection: 'items' | 'events';
  itemTypeLabel?: string;
  partnerId?: string | null;
  itemDetails?: Record<string, unknown>;
  createdAt?: unknown;
}

export interface FavoritesPort {
  addFavorite(data: FavoriteDocument): Promise<void>;
  removeFavorite(userId: string, itemCollection: 'items' | 'events', itemId: string): Promise<void>;
  getUserFavorites(userId: string): Promise<FavoriteDocument[]>;
}
