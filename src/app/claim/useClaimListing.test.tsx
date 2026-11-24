import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useUIStore } from '../../shared/stores/useUIStore';
import { useClaimStore } from '../stores/claimStore';

const auth = vi.hoisted(() => ({
  value: { user: null as unknown, profile: null as unknown, loading: false },
}));
vi.mock('../../domain/user', () => ({ useAccount: () => auth.value }));

import { useClaimListing } from './useClaimListing';

const target = {
  itemId: 'item-1',
  name: 'Cantinho do Preá',
  category: 'restaurant',
  city: null,
  image: null,
};

describe('"Sou o dono" sem conta (D35, 4a)', () => {
  beforeEach(() => {
    auth.value = { user: null, profile: null, loading: false };
    useClaimStore.setState({ target: null, waiting: null });
    useUIStore.setState({ isLoginModalOpen: false, loginNote: null });
  });

  it('abre o acesso com o lugar escrito e volta para o pedido depois do @', () => {
    const { result, rerender } = renderHook(() => useClaimListing());
    act(() => result.current(target));
    expect(useUIStore.getState()).toMatchObject({
      isLoginModalOpen: true,
      loginModalTab: 'login',
      loginNote: { key: 'claims.loginNote', values: { name: 'Cantinho do Preá' } },
    });
    auth.value = { user: { isAnonymous: false }, profile: { username: 'ana' }, loading: false };
    act(() => useUIStore.setState({ isLoginModalOpen: false }));
    rerender();
    expect(useClaimStore.getState()).toMatchObject({ target, waiting: null });
  });

  it('com conta abre direto; fechar o acesso sem conta desiste', () => {
    const { result, rerender } = renderHook(() => useClaimListing());
    act(() => result.current(target));
    act(() => useUIStore.setState({ isLoginModalOpen: false }));
    rerender();
    expect(useClaimStore.getState().waiting).toBeNull();
    expect(useClaimStore.getState().target).toBeNull();

    auth.value = { user: { isAnonymous: false }, profile: { username: 'ana' }, loading: false };
    rerender();
    act(() => result.current(target));
    expect(useClaimStore.getState().target).toEqual(target);
  });
});
