import React, { createContext, useContext, useEffect, useRef } from 'react';
import { UserRole, UserSession } from '../types/auth';
import { UserProfile } from '../../user/types/user';
import { subscribeToAuthStateUseCase } from '../factory';
import { getCurrentUserUseCase } from '../../user/application/usecases/getCurrentUserUseCase';
import { useAuthStore } from '../stores/useAuthStore';

interface AuthContextType {
  user: UserSession | null;
  profile: UserProfile | null;
  loading: boolean;
  photoURL: string | null;
  setPhotoURL: (url: string | null) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const photoURL = useAuthStore((state) => state.photoURL);
  const loading = useAuthStore((state) => state.loading);
  const setSession = useAuthStore((state) => state.setSession);
  const setProfile = useAuthStore((state) => state.setProfile);
  const setPhotoURL = useAuthStore((state) => state.setPhotoURL);
  const setLoading = useAuthStore((state) => state.setLoading);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const sessionVersionRef = useRef(0);
  const isMountedRef = useRef(true);

  const fetchAndSyncProfile = async (session: UserSession, version: number) => {
    try {
      const userProfile = await getCurrentUserUseCase();
      if (!isMountedRef.current || sessionVersionRef.current !== version) {
        return;
      }
      if (userProfile) {
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
    } catch (err) {
      if (sessionVersionRef.current === version) {
        setProfile(null);
        console.error('Falha ao sincronizar perfil do usuário:', err);
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    const unsubscribe = subscribeToAuthStateUseCase(async (session) => {
      const version = ++sessionVersionRef.current;
      if (!isMountedRef.current) return;
      if (session) {
        setSession(session);
        await fetchAndSyncProfile(session, version);
      } else {
        clearAuth();
      }
      if (isMountedRef.current && sessionVersionRef.current === version) {
        setLoading(false);
      }
    });

    return () => {
      isMountedRef.current = false;
      sessionVersionRef.current += 1;
      unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    const currentUser = useAuthStore.getState().user;
    if (currentUser) {
      const version = sessionVersionRef.current;
      await fetchAndSyncProfile(currentUser, version);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        photoURL,
        setPhotoURL,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext deve ser utilizado envelopado sob um AuthProvider');
  }
  return context;
}
