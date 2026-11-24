import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../shared/i18n';
import { LoginModal } from './LoginModal';

const t = (key: string) => i18n.t(key);

describe('LoginModal (folha de acesso, D33)', () => {
  const mockLogin = vi.fn();
  const mockSignUp = vi.fn();
  const mockLoginWithGoogle = vi.fn();
  const mockForgotPassword = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
    vi.clearAllMocks();
  });
  afterEach(async () => {
    await i18n.changeLanguage('pt-BR');
  });

  const renderModal = (
    initialTab?: 'login' | 'register' | 'forgot',
    note?: { key: string; values?: Record<string, string> }
  ) =>
    render(
      <MemoryRouter>
        <LoginModal
          actions={{
            login: mockLogin,
            signUp: mockSignUp,
            loginWithGoogle: mockLoginWithGoogle,
            forgotPassword: mockForgotPassword,
          }}
          note={note}
          isOpen
          onClose={mockOnClose}
          initialTab={initialTab}
          renderTerms={(onBack) => (
            <button type="button" onClick={onBack}>
              termos-e-politicas
            </button>
          )}
        />
      </MemoryRouter>
    );
  const submit = () => {
    const button = document.querySelector<HTMLButtonElement>('form button[type="submit"]');
    if (!button) throw new Error('sem botão de envio');
    expect(button).toHaveTextContent(t('auth.login.submit'));
    return button;
  };

  it('abre como folha com título, as abas Entrar e Criar conta e os campos', () => {
    renderModal();
    expect(screen.getByRole('dialog', { name: t('auth.tabs.label') })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: t('auth.tabs.register') })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(t('auth.loginEmailPlaceholder'))).toBeInTheDocument();
    expect(screen.getByPlaceholderText(t('auth.field.current.placeholder'))).toBeInTheDocument();
  });

  it('erros de validação vêm traduzidos, ligados aos campos', async () => {
    renderModal();
    fireEvent.click(submit());
    expect(await screen.findByText(t('auth.validation.emailRequired'))).toBeInTheDocument();
    expect(screen.getByText(t('auth.validation.passwordRequired'))).toBeInTheDocument();
    expect(screen.getByPlaceholderText(t('auth.loginEmailPlaceholder'))).toHaveAttribute(
      'aria-describedby',
      'login-email-error'
    );
  });

  it('entra com e-mail e senha', async () => {
    mockLogin.mockResolvedValueOnce({ user: { uid: 'test-123' } });
    renderModal();
    fireEvent.change(screen.getByPlaceholderText(t('auth.loginEmailPlaceholder')), {
      target: { value: 'user@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(t('auth.field.current.placeholder')), {
      target: { value: 'password123' },
    });
    fireEvent.click(submit());
    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith('user@test.com', 'password123'));
    await waitFor(() => expect(mockOnClose).toHaveBeenCalled());
  });

  it('erro do Firebase vira mensagem traduzida, sem o texto do SDK', async () => {
    mockLogin.mockRejectedValueOnce({ code: 'auth/wrong-password', message: 'Firebase: internal' });
    renderModal();
    fireEvent.change(screen.getByPlaceholderText(t('auth.loginEmailPlaceholder')), {
      target: { value: 'user@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(t('auth.field.current.placeholder')), {
      target: { value: 'wrong' },
    });
    fireEvent.click(submit());
    expect(await screen.findByText(t('auth.errors.wrongCredentials'))).toBeInTheDocument();
    expect(screen.queryByText(/Firebase/)).toBeNull();
  });

  it('a aba Criar conta troca para o cadastro', async () => {
    renderModal();
    fireEvent.click(screen.getByRole('button', { name: t('auth.tabs.register') }));
    expect(
      await screen.findByRole('button', { name: t('auth.register.submit') })
    ).toBeInTheDocument();
  });

  it('aviso dos Termos abaixo do Google e de "Cadastrar"; os Termos abrem e voltam sem perder o que foi digitado (D35 1b)', async () => {
    renderModal('register');
    expect(screen.getByText(/Ao criar a conta, você concorda/)).toBeTruthy();
    const email = screen.getByPlaceholderText(t('auth.registerEmailPlaceholder'));
    fireEvent.change(email, { target: { value: 'ana@exemplo.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Termos de uso' }));
    fireEvent.click(await screen.findByRole('button', { name: 'termos-e-politicas' }));
    await waitFor(() =>
      expect(screen.getByPlaceholderText(t('auth.registerEmailPlaceholder'))).toHaveValue(
        'ana@exemplo.com'
      )
    );
    fireEvent.click(
      screen.getAllByRole('button', { name: t('auth.tabs.login') })[0] as HTMLElement
    );
    expect(await screen.findByText(/Ao continuar, você concorda/)).toBeTruthy();
  });

  it('mostra no alto de onde a pessoa veio (D35)', () => {
    renderModal('register', { key: 'partnerGuide.join.inviteNote' });
    expect(
      screen.getByText('Depois de criar a conta, você segue para o cadastro do seu negócio.')
    ).toBeTruthy();
  });

  it('esqueci a senha abre a recuperação e volta para entrar', async () => {
    renderModal('forgot');
    expect(screen.getByRole('dialog', { name: t('auth.forgot.title') })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: t('auth.forgot.back') }));
    expect(await screen.findByRole('dialog', { name: t('auth.tabs.label') })).toBeInTheDocument();
  });

  it('em francês, tudo sai em francês', async () => {
    await i18n.changeLanguage('fr');
    renderModal();
    expect(
      screen.getByRole('dialog', { name: 'Se connecter ou créer un compte' })
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('L’e-mail de votre compte')).toBeInTheDocument();
  });
});
