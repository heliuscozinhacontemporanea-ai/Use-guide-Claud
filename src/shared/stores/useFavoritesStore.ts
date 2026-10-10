import { create } from 'zustand';
import {
  addFavoriteUseCase,
  removeFavoriteUseCase,
  subscribeUserFavoritesUseCase,
  type FavoriteItem,
  type FavoriteItemDetails,
} from '../../domain/favorites';
import { trackInteractionUseCase as trackInteraction } from '../../domain/insights';

export interface FavoritesStoreState {
  favorites: FavoriteItem[];
  favoriteItemIds: Set<string>;
  loading: boolean;
  activeUserId: string | null;
  unsubscribeListener: (() => void) | null;

  initUserFavorites: (userId: string | null) => void;
  isFavorited: (itemId: string) => boolean;
  toggleFavorite: (
    userId: string | null,
    itemId: string,
    itemData?: {
      collectionName: 'items' | 'events';
      itemTypeLabel?: string;
      partnerId?: string;
      itemDetails?: FavoriteItemDetails;
    }
  ) => Promise<void>;
  removeFavoriteItem: (
    userId: string | null,
    itemId: string,
    itemCollection?: 'items' | 'events'
  ) => Promise<void>;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesStoreState>((set, get) => ({
  favorites: [],
  favoriteItemIds: new Set<string>(),
  loading: false,
  activeUserId: null,
  unsubscribeListener: null,

  initUserFavorites: (userId) => {
    const { activeUserId, unsubscribeListener } = get();

    if (activeUserId === userId && unsubscribeListener) {
      return;
    }

    if (unsubscribeListener) {
      unsubscribeListener();
    }

    if (!userId) {
      set({
        favorites: [],
        favoriteItemIds: new Set<string>(),
        loading: false,
        activeUserId: null,
        unsubscribeListener: null,
      });
      return;
    }

    set({ loading: true, activeUserId: userId });

    const unsubscribe = subscribeUserFavoritesUseCase(
      userId,
      (favs) => {
        set({
          favorites: favs,
          favoriteItemIds: new Set(favs.map((f) => f.itemId)),
          loading: false,
        });
      },
      (error) => {
        console.error('[useFavoritesStore Error]:', error);
        set({ loading: false });
      }
    );

    set({ unsubscribeListener: unsubscribe });
  },

  isFavorited: (itemId) => {
    return get().favoriteItemIds.has(itemId);
  },

  toggleFavorite: async (userId, itemId, itemData) => {
    if (!userId || !itemId) return;

    const { favoriteItemIds, favorites } = get();
    const currentlyFavorited = favoriteItemIds.has(itemId);

    // Otimista
    if (currentlyFavorited) {
      const existingFav = favorites.find((f) => f.itemId === itemId);
      const collectionName = itemData?.collectionName || existingFav?.itemCollection || 'items';
      const nextIds = new Set(favoriteItemIds);
      nextIds.delete(itemId);
      const nextFavorites = favorites.filter((f) => f.itemId !== itemId);
      set({ favoriteItemIds: nextIds, favorites: nextFavorites });

      try {
        await removeFavoriteUseCase(userId, itemId, collectionName);
      } catch (err) {
        console.error('[FavoritesStore] Erro ao remover favorito:', err);
        set({ favoriteItemIds, favorites });
      }
    } else if (itemData) {
      const optimisticFav: FavoriteItem = {
        id: `temp-${Date.now()}`,
        userId,
        itemId,
        itemCollection: itemData.collectionName,
        itemTypeLabel: itemData.itemTypeLabel,
        partnerId: itemData.partnerId,
        createdAt: new Date().toISOString(),
        itemDetails: itemData.itemDetails,
      };

      const nextIds = new Set(favoriteItemIds);
      nextIds.add(itemId);
      const nextFavorites = [optimisticFav, ...favorites];
      set({ favoriteItemIds: nextIds, favorites: nextFavorites });

      try {
        await addFavoriteUseCase(
          userId,
          itemId,
          itemData.collectionName,
          itemData.itemTypeLabel,
          itemData.partnerId,
          itemData.itemDetails
        );
        trackInteraction(itemId, 'favorite', itemData.collectionName, itemData.partnerId);
      } catch (err) {
        console.error('[FavoritesStore] Erro ao adicionar favorito:', err);
        set({ favoriteItemIds, favorites });
      }
    }
  },

  removeFavoriteItem: async (userId, itemId, itemCollection) => {
    if (!userId) return;

    const { favoriteItemIds, favorites } = get();
    const existingFav = favorites.find((f) => f.itemId === itemId);
    const targetCollection = itemCollection || existingFav?.itemCollection || 'items';
    const nextIds = new Set(favoriteItemIds);
    nextIds.delete(itemId);
    const nextFavorites = favorites.filter((f) => f.itemId !== itemId);
    set({ favoriteItemIds: nextIds, favorites: nextFavorites });

    try {
      await removeFavoriteUseCase(userId, itemId, targetCollection);
    } catch (err) {
      console.error('[FavoritesStore] Erro ao remover favorito:', err);
      set({ favoriteItemIds, favorites });
    }
  },

  clearFavorites: () => {
    const { unsubscribeListener } = get();
    if (unsubscribeListener) {
      unsubscribeListener();
    }
    set({
      favorites: [],
      favoriteItemIds: new Set<string>(),
      loading: false,
      activeUserId: null,
      unsubscribeListener: null,
    });
  },
}));
