import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '../stores/useAuthStore';
import { UserRole, type UserSession } from '../types/auth';
import { AuthProvider, useAuthContext } from './AuthContext';

let emit: ((session: UserSession | null) => void) | null = null;
const unsubscribe = vi.fn();

vi.mock('../factory', () => ({
  subscribeToAuthStateUseCase: (callback: (session: UserSession | null) => void) => {
    emit = callback;
    return unsubscribe;
  },
}));

const SESSION: UserSession = {
  uid: 'u1',
  email: 'ana@exemplo.com',
  displayName: 'Ana',
  photoURL: null,
  emailVerified: true,
  role: UserRole.ADMIN,
  isAnonymous: false,
};

function Consumer() {
  const { user, loading } = useAuthContext();
  return (
    <span data-testid="state">
      {loading ? 'loading' : user ? `${user.uid}:${user.role}` : 'no-user'}
    </span>
  );
}

describe('AuthContext (só a sessão, B77)', () => {
  beforeEach(() => {
    emit = null;
    unsubscribe.mockClear();
    useAuthStore.setState({ user: null, loading: true });
  });

  it('carrega até o Firebase dizer quem está logado, com o papel das claims', () => {
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );
    expect(screen.getByTestId('state').textContent).toBe('loading');
    act(() => emit?.(SESSION));
    expect(screen.getByTestId('state').textContent).toBe('u1:admin');
    act(() => emit?.(null));
    expect(screen.getByTestId('state').textContent).toBe('no-user');
  });

  it('para de ouvir o Firebase ao desmontar', () => {
    const { unmount } = render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );
    unmount();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it('fora do provedor, avisa quem usou errado', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<Consumer />)).toThrow(/AuthProvider/);
  });
});
