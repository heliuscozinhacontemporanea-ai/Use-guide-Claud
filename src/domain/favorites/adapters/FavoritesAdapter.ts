import { FavoritesPort } from '../ports/favoritesPort';
import { FavoriteItem, FavoriteItemDetails } from '../types/favorite';
import { queryDocumentsUseCase, subscribeToCollectionUseCase } from '../../database';
import { firebaseApiFetch } from '../../../shared/infrastructure/firebase/firebaseApiFetch';

export class FavoritesAdapter implements FavoritesPort {
  async addFavorite(
    _userId: string,
    itemId: string,
    itemCollection: 'items' | 'events',
    itemTypeLabel?: string,
    partnerId?: string,
    itemDetails?: FavoriteItemDetails
  ): Promise<void> {
    const res = await firebaseApiFetch(
      '/api/favorites',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId,
          itemCollection,
          itemTypeLabel: itemTypeLabel || '',
          partnerId: partnerId || null,
          itemDetails: itemDetails || undefined,
        }),
      },
      { requireAuth: true }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro ao salvar favorito no backend');
    }
  }

  async removeFavorite(
    _userId: string,
    itemId: string,
    itemCollection: 'items' | 'events'
  ): Promise<void> {
    const res = await firebaseApiFetch(
      `/api/favorites/${itemCollection}/${itemId}`,
      {
        method: 'DELETE',
      },
      { requireAuth: true }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro ao remover favorito no backend');
    }
  }

  async getUserFavorites(userId: string): Promise<FavoriteItem[]> {
    return queryDocumentsUseCase<FavoriteItem>('favorites', [
      { field: 'userId', op: '==', value: userId },
    ]);
  }

  subscribeUserFavorites(
    userId: string,
    onUpdate: (favorites: FavoriteItem[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    return subscribeToCollectionUseCase<FavoriteItem>('favorites', onUpdate, onError, [
      { field: 'userId', op: '==', value: userId },
    ]);
  }
}
