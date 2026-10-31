import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../shared/i18n';
import { UserRole } from '../types/auth';

vi.mock('../factory', () => ({
  refreshEmailVerifiedUseCase: vi.fn(),
  sendEmailVerificationUseCase: vi.fn(),
}));

import { refreshEmailVerifiedUseCase, sendEmailVerificationUseCase } from '../factory';
import { useAuthStore } from '../stores/useAuthStore';
import { useEmailVerificationPromptStore } from '../stores/useEmailVerificationPromptStore';
import { EmailVerificationPrompt } from './EmailVerificationPrompt';

function signIn(emailVerified: boolean) {
  useAuthStore.setState({
    user: {
      uid: 'u1',
      email: 'ana@exemplo.com',
      displayName: 'Ana',
      photoURL: null,
      emailVerified,
      role: UserRole.USER,
      isAnonymous: false,
    },
  });
}

describe('EmailVerificationPrompt', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await i18n.changeLanguage('pt-BR');
    useEmailVerificationPromptStore.setState({ reason: null, sentAt: null });
    signIn(false);
  });

  it('fica fechado sem pedido de abertura', () => {
    render(<EmailVerificationPrompt />);
    expect(screen.queryByText('Confirme seu e-mail')).toBeNull();
  });

  it('depois do cadastro mostra o e-mail e espera 60 s para enviar outro link', () => {
    useEmailVerificationPromptStore.setState({ reason: 'signup', sentAt: Date.now() });
    render(<EmailVerificationPrompt />);
    expect(screen.getByText(/Enviamos um link para ana@exemplo.com/)).toBeTruthy();
    const resend = screen.getByRole('button', { name: /Enviar outro link em 60 s/ });
    expect((resend as HTMLButtonElement).disabled).toBe(true);
  });

  it('"Já confirmei" avisa quando o e-mail ainda não foi confirmado', async () => {
    vi.mocked(refreshEmailVerifiedUseCase).mockResolvedValue(false);
    act(() => useEmailVerificationPromptStore.getState().open('required'));
    render(<EmailVerificationPrompt />);
    fireEvent.click(screen.getByRole('button', { name: 'Já confirmei' }));
    expect(await screen.findByText(/Ainda não aparece confirmado/)).toBeTruthy();
  });

  it('"Já confirmei" marca a conta como confirmada', async () => {
    vi.mocked(refreshEmailVerifiedUseCase).mockResolvedValue(true);
    act(() => useEmailVerificationPromptStore.getState().open('required'));
    render(<EmailVerificationPrompt />);
    fireEvent.click(screen.getByRole('button', { name: 'Já confirmei' }));
    expect(await screen.findByText('E-mail confirmado.')).toBeTruthy();
    expect(useAuthStore.getState().user?.emailVerified).toBe(true);
  });

  it('envia outro link no idioma ativo e mostra o limite do Firebase', async () => {
    vi.mocked(sendEmailVerificationUseCase)
      .mockResolvedValueOnce()
      .mockRejectedValueOnce(new Error('TOO_MANY_REQUESTS'));
    act(() => useEmailVerificationPromptStore.getState().open('required'));
    render(<EmailVerificationPrompt />);
    fireEvent.click(screen.getByRole('button', { name: 'Enviar outro link' }));
    expect(await screen.findByText('Link enviado para ana@exemplo.com.')).toBeTruthy();
    expect(sendEmailVerificationUseCase).toHaveBeenCalledWith('pt-BR');

    act(() => useEmailVerificationPromptStore.setState({ sentAt: null }));
    await waitFor(() =>
      expect(
        (screen.getByRole('button', { name: 'Enviar outro link' }) as HTMLButtonElement).disabled
      ).toBe(false)
    );
    fireEvent.click(screen.getByRole('button', { name: 'Enviar outro link' }));
    expect(await screen.findByText(/Muitos envios seguidos/)).toBeTruthy();
  });
});
