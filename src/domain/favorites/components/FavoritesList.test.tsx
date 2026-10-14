import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../shared/i18n';
import { FavoritesList } from './FavoritesList';
import type { FavoriteItem } from '../types/favorite';

const favoritesState = vi.hoisted(() => ({
  favorites: [] as FavoriteItem[],
  loading: false,
  removeFavoriteItem: vi.fn(),
}));

vi.mock('../hooks/useFavorites', () => ({
  useFavorites: () => ({
    favorites: favoritesState.favorites,
    loading: favoritesState.loading,
    removeFavoriteItem: favoritesState.removeFavoriteItem,
  }),
}));

describe('FavoritesList', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
    vi.clearAllMocks();
    favoritesState.favorites = [];
    favoritesState.loading = false;
  });

  it('renderiza estado vazio quando não há favoritos', () => {
    const onBack = vi.fn();
    render(<FavoritesList onBack={onBack} />);

    expect(screen.getByText('Nenhum favorito salvo')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Voltar para o menu principal' }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('renderiza itens favoritos e dispara onSelectItem ao clicar', () => {
    favoritesState.favorites = [
      {
        id: 'fav-1',
        userId: 'u1',
        itemId: 'item-123',
        itemCollection: 'items',
        createdAt: new Date().toISOString(),
        itemDetails: {
          name: 'Passeio Lagoa do Paraíso',
          category: 'tour',
          location: 'jeri',
          rating: 4.8,
        },
      },
    ];

    const onSelectItem = vi.fn();
    render(<FavoritesList onBack={vi.fn()} onSelectItem={onSelectItem} />);

    expect(screen.getByText('Passeio Lagoa do Paraíso')).toBeTruthy();
    fireEvent.click(screen.getByText('Passeio Lagoa do Paraíso'));

    expect(onSelectItem).toHaveBeenCalledWith({ id: 'item-123', category: 'tour' });
  });

  it('chama removeFavoriteItem ao clicar no botão de remover', () => {
    favoritesState.favorites = [
      {
        id: 'fav-1',
        userId: 'u1',
        itemId: 'item-123',
        itemCollection: 'items',
        createdAt: new Date().toISOString(),
        itemDetails: {
          name: 'Item Teste',
          category: 'sight',
        },
      },
    ];

    render(<FavoritesList onBack={vi.fn()} />);
    const removeBtn = screen.getByRole('button', { name: 'Remover Item Teste dos favoritos' });
    fireEvent.click(removeBtn);
    expect(favoritesState.removeFavoriteItem).toHaveBeenCalledWith('item-123');
  });
});
