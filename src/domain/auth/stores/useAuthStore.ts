import { create } from 'zustand';
import { UserSession, UserRole } from '../types/auth';
import type { UserProfile } from '../../user/types/user';

export interface AuthStoreState {
  user: UserSession | null;
  profile: UserProfile | null;
  photoURL: string | null;
  loading: boolean;

  setUser: (user: UserSession | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setPhotoURL: (photoURL: string | null) => void;
  setLoading: (loading: boolean) => void;
  /** O Firebase não avisa quando o e-mail é confirmado; quem relê a conta atualiza aqui. */
  setEmailVerified: (emailVerified: boolean) => void;
  setSession: (session: UserSession | null, profile?: UserProfile | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  user: null,
  profile: null,
  photoURL: null,
  loading: true,

  setUser: (user) => set({ user }),
  setProfile: (profile) =>
    set((state) => ({
      profile,
      photoURL: profile?.photoURL || state.photoURL || state.user?.photoURL || null,
      user: state.user
        ? {
            ...state.user,
            photoURL: profile?.photoURL || state.photoURL || state.user.photoURL,
            role:
              state.user.role === UserRole.ADMIN
                ? UserRole.ADMIN
                : profile?.role === UserRole.PARTNER
                  ? UserRole.PARTNER
                  : UserRole.USER,
          }
        : null,
    })),
  setPhotoURL: (photoURL) =>
    set((state) => ({
      photoURL,
      user: state.user ? { ...state.user, photoURL } : null,
      profile: state.profile ? { ...state.profile, photoURL } : null,
    })),
  setLoading: (loading) => set({ loading }),
  setEmailVerified: (emailVerified) =>
    set((state) => ({ user: state.user ? { ...state.user, emailVerified } : null })),
  setSession: (session, profile = null) =>
    set((state) => {
      if (!session) {
        return {
          user: null,
          profile: null,
          photoURL: null,
          loading: false,
        };
      }

      const sameUser = state.user?.uid === session.uid;
      const activeProfile = profile ?? (sameUser ? state.profile : null);
      const activePhoto =
        activeProfile?.photoURL ?? session.photoURL ?? (sameUser ? state.photoURL : null);
      const resolvedRole =
        session.role === UserRole.ADMIN
          ? UserRole.ADMIN
          : activeProfile?.role === UserRole.PARTNER
            ? UserRole.PARTNER
            : UserRole.USER;

      return {
        user: {
          ...session,
          photoURL: activePhoto,
          role: resolvedRole,
        },
        profile: activeProfile,
        photoURL: activePhoto,
        loading: true,
      };
    }),
  clearAuth: () =>
    set({
      user: null,
      profile: null,
      photoURL: null,
      loading: false,
    }),
}));
