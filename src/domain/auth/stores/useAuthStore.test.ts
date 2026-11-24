import { beforeEach, describe, expect, it } from 'vitest';
import { UserRole, type UserSession } from '../types/auth';
import { useAuthStore } from './useAuthStore';

const SESSION: UserSession = {
  uid: 'u1',
  email: 'ana@exemplo.com',
  displayName: 'Ana',
  photoURL: null,
  emailVerified: false,
  role: UserRole.USER,
  isAnonymous: false,
};

describe('useAuthStore (só a sessão, B77)', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, loading: true });
  });

  it('começa carregando e sem ninguém', () => {
    expect(useAuthStore.getState()).toMatchObject({ user: null, loading: true });
  });

  it('guarda a sessão como veio do Firebase e para de carregar', () => {
    useAuthStore.getState().setSession(SESSION);
    expect(useAuthStore.getState()).toMatchObject({ user: SESSION, loading: false });
  });

  it('marca o e-mail confirmado sem mexer no resto da sessão', () => {
    useAuthStore.getState().setSession(SESSION);
    useAuthStore.getState().setEmailVerified(true);
    expect(useAuthStore.getState().user).toEqual({ ...SESSION, emailVerified: true });
  });

  it('sem sessão, confirmar e-mail não cria uma', () => {
    useAuthStore.getState().setEmailVerified(true);
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('sair limpa a sessão', () => {
    useAuthStore.getState().setSession(SESSION);
    useAuthStore.getState().clearAuth();
    expect(useAuthStore.getState()).toMatchObject({ user: null, loading: false });
  });
});
