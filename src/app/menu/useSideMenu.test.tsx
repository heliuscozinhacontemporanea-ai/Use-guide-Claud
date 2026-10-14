import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { useSideMenu } from './useSideMenu';

function setup(initialEntry = '/') {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>
  );
  return renderHook(
    () => {
      const menu = useSideMenu();
      const location = useLocation();
      return { menu, search: location.search };
    },
    { wrapper }
  );
}

describe('useSideMenu', () => {
  it('abre na tela principal e avança para favoritos dentro do menu', () => {
    const { result } = setup();
    act(() => result.current.menu.openMenu());
    expect(result.current.search).toBe('?menu=1');
    act(() => result.current.menu.openMenu('favorites'));
    expect(result.current.menu.view).toBe('favorites');
    expect(result.current.search).toBe('?menu=favorites');
  });

  it('voltar depois de avançar desempilha o histórico até a tela anterior', () => {
    const { result } = setup();
    act(() => result.current.menu.openMenu());
    act(() => result.current.menu.openMenu('settings'));
    act(() => result.current.menu.openMenu('language'));
    act(() => result.current.menu.backTo('settings'));
    expect(result.current.menu.view).toBe('settings');
    act(() => result.current.menu.backTo('main'));
    expect(result.current.menu.view).toBe('main');
    expect(result.current.menu.isOpen).toBe(true);
  });

  it('link direto para uma sub-tela: voltar troca para a tela-mãe sem sair do menu', () => {
    const { result } = setup('/?menu=bookings');
    expect(result.current.menu.view).toBe('bookings');
    act(() => result.current.menu.backTo('main'));
    expect(result.current.menu.view).toBe('main');
  });

  it('abrir reservas a partir do detalhe do item fecha o item na mesma navegação', () => {
    const { result } = setup('/passeios?item=i1&type=item');
    act(() => result.current.menu.openMenu('bookings', { closeItem: true }));
    expect(result.current.search).toBe('?menu=bookings');
  });

  it('escolher um favorito fecha o menu e abre o item numa única troca de URL', () => {
    const { result } = setup('/?menu=favorites');
    act(() => result.current.menu.closeMenuAndOpenItem({ id: 'ev1', category: 'event' }));
    expect(result.current.menu.isOpen).toBe(false);
    expect(result.current.search).toBe('?item=ev1&type=event');
  });
});
