export interface FavoriteItemDetails {
  name: string;
  image?: string;
  category?: string;
  location?: string;
  rating?: number;
  description?: string;
}

export interface FavoriteItem {
  id: string;
  userId: string;
  itemId: string;
  itemCollection: 'items' | 'events';
  itemTypeLabel?: string;
  partnerId?: string;
  createdAt: string;
  itemDetails?: FavoriteItemDetails;
}
