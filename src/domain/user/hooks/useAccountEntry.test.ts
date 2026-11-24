import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../shared/i18n';
import { nameFromProvider } from '../utils/providerName';
import { useAccountEntry } from './useAccountEntry';

const m = vi.hoisted(() => ({
  loginWithEmailUseCase: vi.fn(),
  registerWithEmailUseCase: vi.fn(),
  loginWithGoogleUseCase: vi.fn(),
  resetPasswordUseCase: vi.fn(),
  startEmailVerificationUseCase: vi.fn(),
  getCurrentUserUseCase: vi.fn(),
  updateCurrentUserUseCase: vi.fn(),
  refreshProfile: vi.fn(),
}));

vi.mock('../../auth', () => ({
  loginWithEmailUseCase: m.loginWithEmailUseCase,
  registerWithEmailUseCase: m.registerWithEmailUseCase,
  loginWithGoogleUseCase: m.loginWithGoogleUseCase,
  resetPasswordUseCase: m.resetPasswordUseCase,
  startEmailVerificationUseCase: m.startEmailVerificationUseCase,
}));
vi.mock('../application/usecases/getCurrentUserUseCase', () => ({
  getCurrentUserUseCase: m.getCurrentUserUseCase,
}));
vi.mock('../application/usecases/updateCurrentUserUseCase', () => ({
  updateCurrentUserUseCase: m.updateCurrentUserUseCase,
}));
vi.mock('../context/AccountContext', () => ({
  useAccount: () => ({ refreshProfile: m.refreshProfile }),
}));

describe('Entrar e criar conta com o perfil junto (B77)', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await i18n.changeLanguage('pt-BR');
  });
  afterEach(async () => {
    await i18n.changeLanguage('pt-BR');
  });

  it('cadastro grava nome, telefone e o aceite dos Termos, e manda o código no idioma da tela', async () => {
    await i18n.changeLanguage('fr');
    m.registerWithEmailUseCase.mockResolvedValueOnce({ uid: 'ana' });
    const { result } = renderHook(() => useAccountEntry());
    await act(() => result.current.signUp('ana@ex.com', 'Senha!123', 'Ana', 'Lima', '+5588999'));
    expect(m.updateCurrentUserUseCase).toHaveBeenCalledWith({
      firstName: 'Ana',
      lastName: 'Lima',
      phone: '+5588999',
      acceptedUseTerms: true,
    });
    expect(m.startEmailVerificationUseCase).toHaveBeenCalledWith('fr');
    expect(m.refreshProfile).toHaveBeenCalled();
    expect(m.updateCurrentUserUseCase.mock.invocationCallOrder[0]).toBeLessThan(
      m.refreshProfile.mock.invocationCallOrder[0] ?? 0
    );
  });

  it('primeiro login com Google cria o perfil com o nome da conta Google', async () => {
    m.loginWithGoogleUseCase.mockResolvedValueOnce({ displayName: 'Ana Maria Lima' });
    m.getCurrentUserUseCase.mockResolvedValueOnce({ uid: 'ana', email: 'a@ex.com' });
    const { result } = renderHook(() => useAccountEntry());
    await act(() => result.current.loginWithGoogle());
    expect(m.updateCurrentUserUseCase).toHaveBeenCalledWith({
      firstName: 'Ana',
      lastName: 'Maria Lima',
      phone: '',
      acceptedUseTerms: true,
    });
  });

  it('conta Google sem nome ganha o nome padrão no idioma da tela', async () => {
    await i18n.changeLanguage('en');
    m.loginWithGoogleUseCase.mockResolvedValueOnce({ displayName: null });
    m.getCurrentUserUseCase.mockResolvedValueOnce(null);
    const { result } = renderHook(() => useAccountEntry());
    await act(() => result.current.loginWithGoogle());
    expect(m.updateCurrentUserUseCase).toHaveBeenCalledWith(
      expect.objectContaining({ firstName: 'New', lastName: 'User' })
    );
  });

  it('quem já tem perfil entra pelo Google sem regravar nada', async () => {
    m.loginWithGoogleUseCase.mockResolvedValueOnce({ displayName: 'Outro Nome' });
    m.getCurrentUserUseCase.mockResolvedValueOnce({ uid: 'ana', firstName: 'Ana' });
    const { result } = renderHook(() => useAccountEntry());
    await act(() => result.current.loginWithGoogle());
    expect(m.updateCurrentUserUseCase).not.toHaveBeenCalled();
    expect(m.refreshProfile).toHaveBeenCalled();
  });

  it('entrar por e-mail relê o perfil; falha sobe para a tela traduzir', async () => {
    m.loginWithEmailUseCase.mockResolvedValueOnce({ uid: 'ana' });
    const { result } = renderHook(() => useAccountEntry());
    await act(() => result.current.login('ana@ex.com', 'x'));
    expect(m.refreshProfile).toHaveBeenCalledTimes(1);
    m.loginWithEmailUseCase.mockRejectedValueOnce({ code: 'auth/wrong-password' });
    await expect(result.current.login('ana@ex.com', 'y')).rejects.toMatchObject({
      code: 'auth/wrong-password',
    });
  });
});

describe('nameFromProvider', () => {
  const fallback = { first: 'Novo', last: 'Usuário' };

  it('um nome só leva o sobrenome padrão, porque o servidor exige os dois', () => {
    expect(nameFromProvider('  Maria  ', fallback)).toEqual({
      firstName: 'Maria',
      lastName: 'Usuário',
    });
  });

  it('corta nome comprido vindo do provedor', () => {
    const long = `${'a'.repeat(60)} ${'b'.repeat(60)}`;
    const name = nameFromProvider(long, fallback);
    expect(name.firstName).toHaveLength(50);
    expect(name.lastName).toHaveLength(50);
  });
});
