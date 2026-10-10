import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './useAuthStore';
import { UserRole, UserSession } from '../types/auth';
import type { UserProfile } from '../../user/types/user';

describe('useAuthStore (In-Memory Auth Store)', () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
  });

  it('initializes with default empty state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.profile).toBeNull();
    expect(state.photoURL).toBeNull();
  });

  it('resolves ADMIN role when session claims admin', () => {
    const adminSession: UserSession = {
      uid: 'admin-1',
      email: 'admin@example.com',
      displayName: 'Admin User',
      photoURL: null,
      emailVerified: true,
      role: UserRole.ADMIN,
      isAnonymous: false,
    };
    const userProfile: UserProfile = {
      uid: 'admin-1',
      email: 'admin@example.com',
      displayName: 'Admin User Profile',
      role: UserRole.USER,
      createdAt: '2026-01-01T00:00:00Z',
    };

    useAuthStore.getState().setSession(adminSession, userProfile);

    const currentUser = useAuthStore.getState().user;
    expect(currentUser?.role).toBe(UserRole.ADMIN);
  });

  it('resolves PARTNER role when profile role is partner and session is not admin', () => {
    const regularSession: UserSession = {
      uid: 'partner-1',
      email: 'partner@example.com',
      displayName: 'Partner User',
      photoURL: null,
      emailVerified: true,
      role: UserRole.USER,
      isAnonymous: false,
    };
    const partnerProfile: UserProfile = {
      uid: 'partner-1',
      email: 'partner@example.com',
      displayName: 'Partner User Profile',
      role: UserRole.PARTNER,
      createdAt: '2026-01-01T00:00:00Z',
    };

    useAuthStore.getState().setSession(regularSession, partnerProfile);

    const currentUser = useAuthStore.getState().user;
    expect(currentUser?.role).toBe(UserRole.PARTNER);
  });

  it('resolves USER role by default for regular user without partner profile', () => {
    const regularSession: UserSession = {
      uid: 'user-1',
      email: 'user@example.com',
      displayName: 'Regular User',
      photoURL: null,
      emailVerified: true,
      role: UserRole.USER,
      isAnonymous: false,
    };

    useAuthStore.getState().setSession(regularSession, null);
    expect(useAuthStore.getState().user?.role).toBe(UserRole.USER);
  });

  it('updates role when setProfile is called for existing session', () => {
    const regularSession: UserSession = {
      uid: 'user-1',
      email: 'user@example.com',
      displayName: 'Regular User',
      photoURL: null,
      emailVerified: true,
      role: UserRole.USER,
      isAnonymous: false,
    };

    useAuthStore.getState().setSession(regularSession, null);
    expect(useAuthStore.getState().user?.role).toBe(UserRole.USER);

    const updatedProfile: UserProfile = {
      uid: 'user-1',
      email: 'user@example.com',
      displayName: 'Partner User',
      role: UserRole.PARTNER,
      createdAt: '2026-01-01T00:00:00Z',
    };

    useAuthStore.getState().setProfile(updatedProfile);
    expect(useAuthStore.getState().user?.role).toBe(UserRole.PARTNER);
    expect(useAuthStore.getState().profile).toEqual(updatedProfile);
  });

  it('clears state on clearAuth', () => {
    const session: UserSession = {
      uid: 'user-1',
      email: 'user@example.com',
      displayName: 'Regular User',
      photoURL: null,
      emailVerified: true,
      role: UserRole.USER,
      isAnonymous: false,
    };

    useAuthStore.getState().setSession(session, null);
    expect(useAuthStore.getState().user).not.toBeNull();

    useAuthStore.getState().clearAuth();
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.profile).toBeNull();
    expect(state.photoURL).toBeNull();
  });
});
