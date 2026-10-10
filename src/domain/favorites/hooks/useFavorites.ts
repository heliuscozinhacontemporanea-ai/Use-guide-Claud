import { useEffect, useCallback } from 'react';
import { useAuthContext } from '../../auth';
import { useFavoritesStore } from '../../../shared/stores/useFavoritesStore';
import { FavoriteItemDetails } from '../types/favorite';

export function useFavorites(itemId?: string) {
  const { user } = useAuthContext();
  const favorites = useFavoritesStore((state) => state.favorites);
  const loading = useFavoritesStore((state) => state.loading);
  const initUserFavorites = useFavoritesStore((state) => state.initUserFavorites);
  const isFavoritedInStore = useFavoritesStore((state) => state.isFavorited);
  const toggleFavoriteInStore = useFavoritesStore((state) => state.toggleFavorite);
  const removeFavoriteInStore = useFavoritesStore((state) => state.removeFavoriteItem);

  useEffect(() => {
    initUserFavorites(user?.uid || null);
  }, [user?.uid, initUserFavorites]);

  const isFavorited = itemId ? isFavoritedInStore(itemId) : false;

  const toggleFavorite = useCallback(
    async (itemData?: {
      collectionName: 'items' | 'events';
      itemTypeLabel?: string;
      partnerId?: string;
      itemDetails?: FavoriteItemDetails;
    }) => {
      if (!user || !itemId) return;
      await toggleFavoriteInStore(user.uid, itemId, itemData);
    },
    [user, itemId, toggleFavoriteInStore]
  );

  const removeFavoriteItem = useCallback(
    async (targetItemId: string) => {
      if (!user) return;
      await removeFavoriteInStore(user.uid, targetItemId);
    },
    [user, removeFavoriteInStore]
  );

  return {
    favorites,
    isFavorited,
    loading,
    toggleFavorite,
    removeFavoriteItem,
  };
}
