import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const auth = vi.hoisted(() => ({
  value: {
    user: { uid: 'u1', isAnonymous: false } as unknown,
    profile: { firstName: 'Ana', username: null } as unknown,
    loading: false,
    refreshProfile: vi.fn(),
  },
}));

vi.mock('../domain/auth', () => ({
  useAuthContext: () => auth.value,
  logoutUseCase: vi.fn(),
}));
vi.mock('../domain/user', () => ({
  UsernameOnboardingDialog: () => <div>escolha-do-arroba</div>,
}));

import { UsernameGate } from './UsernameGate';

describe('@ obrigatório (D21)', () => {
  it('pede o @ para conta logada com nome salvo e sem @', () => {
    render(<UsernameGate />);
    expect(screen.getByText('escolha-do-arroba')).toBeTruthy();
  });

  it('não pede para quem já tem @, sem login ou antes do nome ser salvo', () => {
    auth.value = { ...auth.value, profile: { firstName: 'Ana', username: 'ana' } };
    const { rerender } = render(<UsernameGate />);
    expect(screen.queryByText('escolha-do-arroba')).toBeNull();
    auth.value = { ...auth.value, profile: { firstName: '', username: null } };
    rerender(<UsernameGate />);
    expect(screen.queryByText('escolha-do-arroba')).toBeNull();
    auth.value = { ...auth.value, user: null };
    rerender(<UsernameGate />);
    expect(screen.queryByText('escolha-do-arroba')).toBeNull();
  });
});
