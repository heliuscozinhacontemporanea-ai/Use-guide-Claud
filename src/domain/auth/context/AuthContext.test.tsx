import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuthContext } from './AuthContext';
import { useAuthStore } from '../stores/useAuthStore';
import { UserRole, UserSession } from '../types/auth';
import { UserProfile } from '../../user/types/user';

let authStateCallback: ((session: UserSession | null) => void) | null = null;
const mockSubscribeToAuthStateUseCase = vi.fn((callback) => {
  authStateCallback = callback;
  return vi.fn();
});

const mockGetCurrentUserUseCase = vi.fn();

vi.mock('../factory', () => ({
  subscribeToAuthStateUseCase: (cb: any) => mockSubscribeToAuthStateUseCase(cb),
}));

vi.mock('../../user/application/usecases/getCurrentUserUseCase', () => ({
  getCurrentUserUseCase: () => mockGetCurrentUserUseCase(),
}));

function TestConsumer() {
  const { user, profile, loading } = useAuthContext();
  return (
    <div>
      <span data-testid="loading">{loading ? 'loading' : 'ready'}</span>
      <span data-testid="user">{user?.email || 'no-user'}</span>
      <span data-testid="profile">{profile?.displayName || 'no-profile'}</span>
    </div>
  );
}

describe('AuthContext - Race Condition and Stale Async Response', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authStateCallback = null;
    useAuthStore.getState().clearAuth();
  });

  it('descarta resposta assíncrona tardia quando logout ocorre durante carregamento do profile', async () => {
    let resolveProfileA: (value: UserProfile | null) => void;
    const profilePromiseA = new Promise<UserProfile | null>((resolve) => {
      resolveProfileA = resolve;
    });

    mockGetCurrentUserUseCase.mockReturnValueOnce(profilePromiseA);

    const { getByTestId } = render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    const sessionA: UserSession = {
      uid: 'user-a',
      email: 'usera@example.com',
      displayName: 'User A',
      photoURL: null,
      emailVerified: true,
      role: UserRole.USER,
      isAnonymous: false,
    };

    // 1. Simula login da Sessão A
    await act(async () => {
      authStateCallback?.(sessionA);
    });

    expect(getByTestId('user').textContent).toBe('usera@example.com');
    expect(mockGetCurrentUserUseCase).toHaveBeenCalledTimes(1);

    // 2. Antes do perfil A resolver, o usuário faz logout (Sessão limpa)
    await act(async () => {
      authStateCallback?.(null);
    });

    expect(getByTestId('user').textContent).toBe('no-user');
    expect(getByTestId('profile').textContent).toBe('no-profile');

    // 3. Resolução tardia do Perfil A
    const profileA: UserProfile = {
      uid: 'user-a',
      email: 'usera@example.com',
      displayName: 'User A Profile Delayed',
      role: UserRole.USER,
      createdAt: '2026-01-01T00:00:00Z',
    };

    await act(async () => {
      resolveProfileA!(profileA);
    });

    // 4. Confirma que o perfil A NÃO reaparece na tela nem no store
    await waitFor(() => {
      expect(getByTestId('user').textContent).toBe('no-user');
      expect(getByTestId('profile').textContent).toBe('no-profile');
    });

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().profile).toBeNull();
  });

  it('descarta resposta assíncrona tardia quando ocorre troca rápida entre sessões A e B', async () => {
    let resolveProfileA: (value: UserProfile | null) => void;
    const profilePromiseA = new Promise<UserProfile | null>((resolve) => {
      resolveProfileA = resolve;
    });

    const profileB: UserProfile = {
      uid: 'user-b',
      email: 'userb@example.com',
      displayName: 'User B',
      role: UserRole.USER,
      createdAt: '2026-01-01T00:00:00Z',
    };

    mockGetCurrentUserUseCase.mockReturnValueOnce(profilePromiseA).mockResolvedValueOnce(profileB);

    const { getByTestId } = render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    const sessionA: UserSession = {
      uid: 'user-a',
      email: 'usera@example.com',
      displayName: 'User A',
      photoURL: null,
      emailVerified: true,
      role: UserRole.USER,
      isAnonymous: false,
    };

    const sessionB: UserSession = {
      uid: 'user-b',
      email: 'userb@example.com',
      displayName: 'User B',
      photoURL: null,
      emailVerified: true,
      role: UserRole.USER,
      isAnonymous: false,
    };

    // Login A
    await act(async () => {
      authStateCallback?.(sessionA);
    });

    // Rápido login B (sessão anterior sobreposta)
    await act(async () => {
      authStateCallback?.(sessionB);
    });

    await waitFor(() => {
      expect(getByTestId('user').textContent).toBe('userb@example.com');
      expect(getByTestId('profile').textContent).toBe('User B');
    });

    // Resolução tardia de A não deve sobrepor B
    await act(async () => {
      resolveProfileA!({
        uid: 'user-a',
        email: 'usera@example.com',
        displayName: 'User A Stale Profile',
        role: UserRole.USER,
        createdAt: '2026-01-01T00:00:00Z',
      });
    });

    expect(getByTestId('user').textContent).toBe('userb@example.com');
    expect(getByTestId('profile').textContent).toBe('User B');
    expect(useAuthStore.getState().user?.uid).toBe('user-b');
  });

  it('unmounts cleanly, unsubscribes, and ignores pending profile fetch', async () => {
    const mockUnsubscribe = vi.fn();
    mockSubscribeToAuthStateUseCase.mockReturnValueOnce(mockUnsubscribe);

    let resolvePendingProfile: (value: UserProfile | null) => void;
    const pendingPromise = new Promise<UserProfile | null>((resolve) => {
      resolvePendingProfile = resolve;
    });
    mockGetCurrentUserUseCase.mockReturnValueOnce(pendingPromise);

    const { unmount } = render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    const session: UserSession = {
      uid: 'user-unmount',
      email: 'unmount@example.com',
      displayName: 'Unmount User',
      photoURL: null,
      emailVerified: true,
      role: UserRole.USER,
      isAnonymous: false,
    };

    await act(async () => {
      authStateCallback?.(session);
    });

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);

    // Resolving after unmount should not throw or corrupt state
    await act(async () => {
      resolvePendingProfile!({
        uid: 'user-unmount',
        email: 'unmount@example.com',
        displayName: 'Late Profile',
        role: UserRole.USER,
        createdAt: '2026-01-01T00:00:00Z',
      });
    });
  });
});
