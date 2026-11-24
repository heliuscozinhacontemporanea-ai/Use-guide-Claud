import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useUIStore } from '../../shared/stores/useUIStore';
import { usePartnerJoinStore } from '../stores/partnerJoinStore';

const auth = vi.hoisted(() => ({
  value: { user: null as unknown, profile: null as unknown, loading: false },
}));
vi.mock('../../domain/user', () => ({ useAccount: () => auth.value }));

import { usePartnerInvite } from './usePartnerInvite';

describe('convite "Tem um negócio?" (D35, item 9)', () => {
  beforeEach(() => {
    auth.value = { user: null, profile: null, loading: false };
    usePartnerJoinStore.setState({ invited: false, active: false });
    useUIStore.setState({ isLoginModalOpen: false, loginNote: null });
  });

  it('abre "Criar conta" com a linha do convite e, depois do @, o Seja parceiro', () => {
    const openPartnerJoin = vi.fn();
    const { result, rerender } = renderHook(() => usePartnerInvite(openPartnerJoin));
    act(() => result.current());
    expect(useUIStore.getState()).toMatchObject({
      isLoginModalOpen: true,
      loginModalTab: 'register',
      loginNote: { key: 'partnerGuide.join.inviteNote' },
    });
    // Conta criada, ainda sem @: espera.
    auth.value = { user: { isAnonymous: false }, profile: { username: null }, loading: false };
    act(() => useUIStore.setState({ isLoginModalOpen: false }));
    rerender();
    expect(openPartnerJoin).not.toHaveBeenCalled();
    auth.value = { ...auth.value, profile: { username: 'ana', role: 'user' } };
    rerender();
    expect(openPartnerJoin).toHaveBeenCalledTimes(1);
    expect(usePartnerJoinStore.getState().invited).toBe(false);
  });

  it('fechar o acesso sem criar conta encerra o convite; parceiro não reabre o cadastro', () => {
    const openPartnerJoin = vi.fn();
    const { result, rerender } = renderHook(() => usePartnerInvite(openPartnerJoin));
    act(() => result.current());
    act(() => useUIStore.setState({ isLoginModalOpen: false }));
    rerender();
    expect(usePartnerJoinStore.getState().invited).toBe(false);

    act(() => result.current());
    auth.value = {
      user: { isAnonymous: false },
      profile: { username: 'ana', role: 'partner' },
      loading: false,
    };
    rerender();
    expect(openPartnerJoin).not.toHaveBeenCalled();
    expect(usePartnerJoinStore.getState().invited).toBe(false);
  });
});
