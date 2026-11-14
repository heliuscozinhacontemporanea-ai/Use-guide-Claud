import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import type { GuideItem } from '../domain/guide';
import { useOpenListing } from './useOpenListing';

const TOUR = { id: 'i1', name: 'Buggy', category: 'tour' } as GuideItem;
const EVENT = { id: 'ev1', name: 'Luau', category: 'event' } as GuideItem;

function setup(url: string) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[url]}>{children}</MemoryRouter>
  );
  return renderHook(
    () => ({
      listing: useOpenListing({ items: [TOUR], events: [EVENT], catalogReady: true }),
      location: useLocation(),
      navigate: useNavigate(),
    }),
    { wrapper }
  );
}

describe('useOpenListing', () => {
  it('lê o anúncio aberto da URL, item ou evento', () => {
    expect(setup('/passeios?item=i1&type=item').result.current.listing.selectedItem).toBe(TOUR);
    expect(setup('/eventos?item=ev1&type=event').result.current.listing.selectedItem).toBe(EVENT);
    expect(setup('/passeios?item=ev1&type=item').result.current.listing.selectedItem).toBeNull();
  });

  it('abrir e fechar mudam só os parâmetros do anúncio', () => {
    const { result } = setup('/passeios?menu=1');
    act(() => result.current.listing.setSelectedItem(EVENT));
    expect(result.current.location.search).toBe('?menu=1&item=ev1&type=event');
    act(() => result.current.listing.setSelectedItem(null));
    expect(result.current.location.search).toBe('?menu=1');
  });
});

describe('useOpenListing · foto que cresce do cartão', () => {
  it('cresce só depois de um toque; restaurado da URL, não', () => {
    const { result } = setup('/passeios?item=i1&type=item');
    expect(result.current.listing.growsFromCard).toBe(false);

    act(() => result.current.listing.setSelectedItem(null));
    act(() => result.current.listing.setSelectedItem(TOUR));
    expect(result.current.listing.growsFromCard).toBe(true);
  });

  it('trocar de aba e voltar restaura o anúncio sem crescer do cartão', () => {
    const { result } = setup('/passeios');
    act(() => result.current.listing.setSelectedItem(TOUR));
    expect(result.current.listing.growsFromCard).toBe(true);
    act(() => result.current.navigate('/restaurantes'));
    act(() => result.current.navigate('/passeios?item=i1&type=item'));
    expect(result.current.listing.selectedItem).toBe(TOUR);
    expect(result.current.listing.growsFromCard).toBe(false);
  });
});
