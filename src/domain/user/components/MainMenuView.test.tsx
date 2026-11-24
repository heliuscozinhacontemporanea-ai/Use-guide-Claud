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
    onPartnerInvite: vi.fn(),
    onOpenTerms: vi.fn(),
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

  it('quem não é parceiro vê o cartão "Tem um negócio?" abaixo dos destaques (D35, item 9)', () => {
    const props = renderMenu();
    expect(screen.getByText('Tem um negócio?')).toBeTruthy();
    expect(screen.getByText('Anuncie no Use Guide')).toBeTruthy();
    // O cartão vem depois dos destaques e antes de "Minha conta".
    const order = [
      screen.getByText('destaques'),
      screen.getByText('Tem um negócio?'),
      screen.getByRole('button', { name: 'Minha conta' }),
    ];
    for (let index = 1; index < order.length; index += 1) {
      const previous = order[index - 1] as Node;
      const current = order[index] as Node;
      expect(
        previous.compareDocumentPosition(current) & Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy();
    }
    fireEvent.click(screen.getByRole('button', { name: 'Seja parceiro' }));
    expect(props.onPartnersOpen).toHaveBeenCalled();
    expect(screen.getAllByRole('button', { name: 'Seja parceiro' })).toHaveLength(1);
  });

  it('sem login: entrar por e-mail ou Google, sem os destaques', () => {
    renderMenu({ user: null });
    expect(screen.getByRole('heading', { name: 'Entrar ou cadastrar' })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Continuar com Google/ })).toBeTruthy();
    expect(screen.queryByText('destaques')).toBeNull();
  });

  it('sem login: aviso dos Termos e convite discreto, sem a linha Seja parceiro (D35)', () => {
    const props = renderMenu({ user: null });
    expect(screen.queryByRole('button', { name: 'Seja parceiro' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Termos de uso' }));
    expect(props.onOpenTerms).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Política de privacidade' }));
    expect(props.onOpenTerms).toHaveBeenCalledTimes(2);
    fireEvent.click(screen.getByRole('button', { name: 'Crie sua conta para anunciar' }));
    expect(props.onPartnerInvite).toHaveBeenCalled();
  });
});
