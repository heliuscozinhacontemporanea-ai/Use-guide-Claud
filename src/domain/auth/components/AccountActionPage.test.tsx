import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../shared/i18n';

vi.mock('../factory', () => ({ applyEmailVerificationCodeUseCase: vi.fn() }));
vi.mock('./ResetPassword', () => ({ ResetPassword: () => <p>tela de nova senha</p> }));
vi.mock('../../../shared/hooks/useLocalizedRouting', () => ({
  useLocalizedRouting: () => ({ goTo: vi.fn() }),
}));

import { applyEmailVerificationCodeUseCase } from '../factory';
import { AccountActionPage } from './AccountActionPage';

function open(query: string) {
  render(
    <MemoryRouter initialEntries={[`/conta/acao${query}`]}>
      <Routes>
        <Route path="/conta/acao" element={<AccountActionPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('AccountActionPage', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await i18n.changeLanguage('pt-BR');
  });

  it('confirma o e-mail com o código do link', async () => {
    vi.mocked(applyEmailVerificationCodeUseCase).mockResolvedValue();
    open('?mode=verifyEmail&oobCode=abc123');
    expect(await screen.findByText('E-mail confirmado')).toBeTruthy();
    expect(applyEmailVerificationCodeUseCase).toHaveBeenCalledWith('abc123');
  });

  it('link vencido ou já usado', async () => {
    vi.mocked(applyEmailVerificationCodeUseCase).mockRejectedValue(new Error('expired'));
    open('?mode=verifyEmail&oobCode=abc123');
    expect(await screen.findByText('Link inválido')).toBeTruthy();
  });

  it('abre a nova senha no modo resetPassword', () => {
    open('?mode=resetPassword&oobCode=abc123');
    expect(screen.getByText('tela de nova senha')).toBeTruthy();
  });

  it('modo desconhecido é link inválido', () => {
    open('?mode=outro');
    expect(screen.getByText('Link inválido')).toBeTruthy();
    expect(applyEmailVerificationCodeUseCase).not.toHaveBeenCalled();
  });
});
