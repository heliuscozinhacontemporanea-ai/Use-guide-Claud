import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { FavoriteItem } from '../types/favorite';

const m = vi.hoisted(() => ({
  add: vi.fn(),
  remove: vi.fn(),
  subscribe: vi.fn(),
  track: vi.fn(),
  unsubscribe: vi.fn(),
}));

vi.mock('../application/usecases/addFavoriteUseCase', () => ({ addFavoriteUseCase: m.add }));
vi.mock('../application/usecases/removeFavoriteUseCase', () => ({
  removeFavoriteUseCase: m.remove,
}));
vi.mock('../application/usecases/subscribeUserFavoritesUseCase', () => ({
  subscribeUserFavoritesUseCase: m.subscribe,
}));
vi.mock('../../insights', () => ({ trackInteractionUseCase: m.track }));

import { useFavoritesStore } from './useFavoritesStore';

const SAVED: FavoriteItem = {
  id: 'f1',
  userId: 'ana',
  itemId: 'cantinho',
  itemCollection: 'items',
  createdAt: '2026-11-24T10:00:00.000Z',
};
const store = () => useFavoritesStore.getState();

describe('Favoritos (store do domínio favorites)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.subscribe.mockImplementation((_uid, onData: (favs: FavoriteItem[]) => void) => {
      onData([SAVED]);
      return m.unsubscribe;
    });
    store().clearFavorites();
  });

  it('ouve os favoritos de quem entrou e para ao sair', () => {
    store().initUserFavorites('ana');
    expect(store().isFavorited('cantinho')).toBe(true);
    store().initUserFavorites(null);
    expect(m.unsubscribe).toHaveBeenCalledTimes(1);
    expect(store().favorites).toEqual([]);
  });

  it('favoritar aparece na hora e registra a interação', async () => {
    store().initUserFavorites('ana');
    m.add.mockResolvedValueOnce(undefined);
    await store().toggleFavorite('ana', 'buggy', { collectionName: 'items', partnerId: 'p1' });
    expect(store().isFavorited('buggy')).toBe(true);
    expect(m.track).toHaveBeenCalledWith('buggy', 'favorite', 'items', 'p1');
  });

  it('se o servidor recusar, a tela volta como estava', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    store().initUserFavorites('ana');
    m.add.mockRejectedValueOnce(new Error('rede'));
    await store().toggleFavorite('ana', 'buggy', { collectionName: 'items' });
    expect(store().isFavorited('buggy')).toBe(false);
    m.remove.mockRejectedValueOnce(new Error('rede'));
    await store().toggleFavorite('ana', 'cantinho');
    expect(store().isFavorited('cantinho')).toBe(true);
    expect(m.track).not.toHaveBeenCalled();
  });

  it('desfavoritar usa a coleção salva no favorito', async () => {
    store().initUserFavorites('ana');
    m.remove.mockResolvedValueOnce(undefined);
    await store().removeFavoriteItem('ana', 'cantinho');
    expect(m.remove).toHaveBeenCalledWith('ana', 'cantinho', 'items');
    expect(store().isFavorited('cantinho')).toBe(false);
  });
});
