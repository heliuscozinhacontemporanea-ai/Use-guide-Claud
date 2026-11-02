import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../shared/i18n';
import { useUIStore } from '../shared/stores/useUIStore';
import { useMissingItemNotice } from './useMissingItemNotice';

function wrapper(url: string) {
  return ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[url]}>{children}</MemoryRouter>
  );
}

function useCase(props: Parameters<typeof useMissingItemNotice>[0]) {
  useMissingItemNotice(props);
  return useLocation();
}

describe('useMissingItemNotice', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
    vi.restoreAllMocks();
  });

  it('avisa e tira item e type da URL quando o item não está no catálogo carregado', () => {
    const toast = vi.spyOn(useUIStore.getState(), 'showToast');
    const { result } = renderHook(
      () => useCase({ itemId: 'abc', found: false, catalogReady: true }),
      { wrapper: wrapper('/eventos?item=abc&type=event&x=1') }
    );
    expect(toast).toHaveBeenCalledWith('Este item não está mais disponível.', 'info');
    expect(result.current.search).toBe('?x=1');
  });

  it('espera o catálogo carregar e não avisa quando o item existe', () => {
    const toast = vi.spyOn(useUIStore.getState(), 'showToast');
    renderHook(() => useCase({ itemId: 'abc', found: false, catalogReady: false }), {
      wrapper: wrapper('/eventos?item=abc'),
    });
    renderHook(() => useCase({ itemId: 'abc', found: true, catalogReady: true }), {
      wrapper: wrapper('/eventos?item=abc'),
    });
    expect(toast).not.toHaveBeenCalled();
  });
});
