import { createContext, type ReactNode, useContext, useEffect, useMemo } from 'react';
import { subscribeToAuthStateUseCase } from '../factory';
import { useAuthStore } from '../stores/useAuthStore';
import type { UserSession } from '../types/auth';

interface AuthContextType {
  /** Sessão do Firebase Auth; o papel vem só das claims (admin). Parceiro e foto: `useAccount`. */
  user: UserSession | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);

  useEffect(
    () =>
      subscribeToAuthStateUseCase((session) => {
        const { setSession, clearAuth } = useAuthStore.getState();
        if (session) setSession(session);
        else clearAuth();
      }),
    []
  );

  const value = useMemo(() => ({ user, loading }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext deve ser utilizado envelopado sob um AuthProvider');
  }
  return context;
}
