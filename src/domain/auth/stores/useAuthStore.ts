import { create } from 'zustand';
import type { UserSession } from '../types/auth';

/** Só a sessão do Firebase Auth; o perfil (papel de parceiro, foto, @) é do domínio `user` (B77). */
export interface AuthStoreState {
  user: UserSession | null;
  loading: boolean;

  setSession: (session: UserSession | null) => void;
  /** O Firebase não avisa quando o e-mail é confirmado; quem relê a conta atualiza aqui. */
  setEmailVerified: (emailVerified: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  user: null,
  loading: true,

  setSession: (session) => set({ user: session, loading: false }),
  setEmailVerified: (emailVerified) =>
    set((state) => ({ user: state.user ? { ...state.user, emailVerified } : null })),
  clearAuth: () => set({ user: null, loading: false }),
}));
