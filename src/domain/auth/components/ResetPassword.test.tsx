import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../shared/i18n';
import * as authFactory from '../factory';
import { ResetPassword } from './ResetPassword';

vi.mock('../factory', () => ({
  verifyPasswordResetCodeUseCase: vi.fn(),
  confirmPasswordResetUseCase: vi.fn(),
}));

const t = (key: string) => i18n.t(key);

function renderAt(url: string) {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ResetPassword', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
    vi.clearAllMocks();
  });

  it('sem código no link, mostra o erro e o caminho para pedir outro', async () => {
    renderAt('/reset-password');
    expect(await screen.findByText(t('auth.errors.invalidLink'))).toBeInTheDocument();
    expect(screen.getByRole('button', { name: t('auth.reset.requestNew') })).toBeInTheDocument();
  });

  it('link vencido mostra o erro do link', async () => {
    vi.mocked(authFactory.verifyPasswordResetCodeUseCase).mockRejectedValue(new Error('x'));
    renderAt('/reset-password?oobCode=old');
    expect(await screen.findByText(t('auth.errors.expiredLink'))).toBeInTheDocument();
  });

  it('com o link válido, mostra o e-mail, os campos e os requisitos, sem telefone', async () => {
    vi.mocked(authFactory.verifyPasswordResetCodeUseCase).mockResolvedValue('user@example.com');
    renderAt('/reset-password?oobCode=valid-code-123');
    expect(await screen.findByText('user@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(t('auth.field.new.placeholder'))).toBeInTheDocument();
    expect(screen.getByPlaceholderText(t('auth.field.confirm.placeholder'))).toBeInTheDocument();
    expect(screen.getByText(t('auth.requirements.special'))).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/telefone/i)).not.toBeInTheDocument();
  });

  it('valida a senha e redefine', async () => {
    vi.mocked(authFactory.verifyPasswordResetCodeUseCase).mockResolvedValue('user@example.com');
    vi.mocked(authFactory.confirmPasswordResetUseCase).mockResolvedValue();
    renderAt('/reset-password?oobCode=valid-code-123');
    const password = await screen.findByPlaceholderText(t('auth.field.new.placeholder'));
    fireEvent.change(password, { target: { value: 'StrongP@ss1' } });
    fireEvent.change(screen.getByPlaceholderText(t('auth.field.confirm.placeholder')), {
      target: { value: 'StrongP@ss1' },
    });
    fireEvent.click(screen.getByRole('button', { name: t('auth.reset.save') }));
    await waitFor(() =>
      expect(authFactory.confirmPasswordResetUseCase).toHaveBeenCalledWith(
        'valid-code-123',
        'StrongP@ss1'
      )
    );
    expect(await screen.findByText(t('auth.reset.successTitle'))).toBeInTheDocument();
  });
});
