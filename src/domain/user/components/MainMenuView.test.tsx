import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../shared/i18n';
import { UserRole } from '../../auth/types/auth';
import { MainMenuView } from './MainMenuView';

vi.mock('../../auth', () => ({ useAuth: () => ({ loginWithGoogle: vi.fn() }) }));

const USER = {
  uid: 'u1',
  email: 'ana@example.com',
  displayName: 'Ana Souza',
  photoURL: null,
  emailVerified: true,
  role: UserRole.USER,
  isAnonymous: false,
};

function renderMenu(overrides: Partial<Parameters<typeof MainMenuView>[0]> = {}) {
  const props = {
    user: USER,
    userData: { firstName: 'Ana', lastName: 'Souza' },
    memberSince: '2026-03-10T12:00:00.000Z',
    isAdmin: false,
    isPartner: false,
    isUploading: false,
    photoURL: null,
    onClose: vi.fn(),
    onAccountOpen: vi.fn(),
    onPartnersOpen: vi.fn(),
    onAdminOpen: vi.fn(),
    onLogout: vi.fn(),
    onPhotoClick: vi.fn(),
    highlights: <p>destaques</p>,
    ...overrides,
  };
  render(<MainMenuView {...props} />);
  return props;
}

describe('menu lateral como perfil (D19)', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
  });

  it('com login: nome, desde quando, destaques, Minha conta, Seja parceiro e Sair; sem Suporte nem Sobre', () => {
    const props = renderMenu();
    expect(screen.getByRole('heading', { name: 'Ana Souza' })).toBeTruthy();
    expect(screen.getByText('No Use Guide desde março de 2026')).toBeTruthy();
    expect(screen.getByText('destaques')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Minha conta' }));
    expect(props.onAccountOpen).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Seja parceiro' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Sair da conta' }));
    expect(props.onLogout).toHaveBeenCalled();
    expect(screen.queryByText(/Suporte/)).toBeNull();
    expect(screen.queryByText(/Sobre o app/)).toBeNull();
  });

  it('parceiro vê Meu painel no lugar de Seja parceiro', () => {
    const props = renderMenu({ isPartner: true });
    expect(screen.queryByRole('button', { name: 'Seja parceiro' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Meu painel' }));
    expect(props.onAdminOpen).toHaveBeenCalled();
  });

  it('sem login: entrar por e-mail ou Google, sem os destaques', () => {
    renderMenu({ user: null });
    expect(screen.getByRole('heading', { name: 'Entrar ou cadastrar' })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Continuar com Google/ })).toBeTruthy();
    expect(screen.queryByText('destaques')).toBeNull();
  });
});
