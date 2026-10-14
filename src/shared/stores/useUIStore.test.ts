import { beforeEach, describe, expect, it } from 'vitest';
import { useUIStore } from './useUIStore';

describe('modal de login', () => {
  beforeEach(() => {
    useUIStore.getState().closeLoginModal();
  });

  it('abre na aba de login por padrão', () => {
    useUIStore.getState().openLoginModal();
    expect(useUIStore.getState()).toMatchObject({ isLoginModalOpen: true, loginModalTab: 'login' });
  });

  it('"solicitar novo link" abre direto em recuperação de senha', () => {
    useUIStore.getState().openPasswordRecovery();
    expect(useUIStore.getState()).toMatchObject({
      isLoginModalOpen: true,
      loginModalTab: 'forgot',
    });
    useUIStore.getState().openLoginModal();
    expect(useUIStore.getState().loginModalTab).toBe('login');
  });
});
