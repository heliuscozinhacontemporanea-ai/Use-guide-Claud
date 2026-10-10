import { describe, it, expect, vi, beforeEach } from 'vitest';
import { deleteCurrentUserUseCase } from './deleteCurrentUserUseCase';
import { userAdapter } from '../../factory';
import { reauthenticateUseCase, getIdTokenUseCase, logoutUseCase } from '../../../auth';

vi.mock('../../factory', () => ({
  userAdapter: {
    deleteCurrentUser: vi.fn(),
  },
}));

vi.mock('../../../auth', () => ({
  reauthenticateUseCase: vi.fn(),
  getIdTokenUseCase: vi.fn(),
  logoutUseCase: vi.fn(),
}));

describe('deleteCurrentUserUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve reautenticar, renovar token, excluir conta e deslogar quando email e senha forem fornecidos', async () => {
    vi.mocked(reauthenticateUseCase).mockResolvedValueOnce(undefined as any);
    vi.mocked(getIdTokenUseCase).mockResolvedValueOnce('fresh-token');
    vi.mocked(userAdapter.deleteCurrentUser).mockResolvedValueOnce(undefined);
    vi.mocked(logoutUseCase).mockResolvedValueOnce(undefined);

    await deleteCurrentUserUseCase('test@example.com', 'ValidPass123!');

    expect(reauthenticateUseCase).toHaveBeenCalledWith('test@example.com', 'ValidPass123!');
    expect(getIdTokenUseCase).toHaveBeenCalledWith(true);
    expect(userAdapter.deleteCurrentUser).toHaveBeenCalledTimes(1);
    expect(logoutUseCase).toHaveBeenCalledTimes(1);
  });

  it('deve permitir exclusão direta sem credenciais (ex: provedor Google autenticado recentemente)', async () => {
    vi.mocked(userAdapter.deleteCurrentUser).mockResolvedValueOnce(undefined);
    vi.mocked(logoutUseCase).mockResolvedValueOnce(undefined);

    await deleteCurrentUserUseCase();

    expect(reauthenticateUseCase).not.toHaveBeenCalled();
    expect(userAdapter.deleteCurrentUser).toHaveBeenCalledTimes(1);
    expect(logoutUseCase).toHaveBeenCalledTimes(1);
  });

  it('deve lidar com REAUTHENTICATION_REQUIRED e tentar reautenticar se credenciais estiverem disponíveis', async () => {
    const reauthErr = new Error('REAUTHENTICATION_REQUIRED');
    (reauthErr as any).code = 'REAUTHENTICATION_REQUIRED';

    vi.mocked(reauthenticateUseCase).mockResolvedValue(undefined as any);
    vi.mocked(getIdTokenUseCase).mockResolvedValue('new-token');
    // First call throws REAUTHENTICATION_REQUIRED, retry succeeds
    vi.mocked(userAdapter.deleteCurrentUser)
      .mockRejectedValueOnce(reauthErr)
      .mockResolvedValueOnce(undefined);
    vi.mocked(logoutUseCase).mockResolvedValueOnce(undefined);

    await deleteCurrentUserUseCase('user@example.com', 'MyPassword123');

    expect(userAdapter.deleteCurrentUser).toHaveBeenCalledTimes(2);
    expect(logoutUseCase).toHaveBeenCalledTimes(1);
  });

  it('deve propagar erro de REAUTHENTICATION_REQUIRED se não houver credenciais para reautenticar', async () => {
    const reauthErr = new Error('REAUTHENTICATION_REQUIRED');
    (reauthErr as any).code = 'REAUTHENTICATION_REQUIRED';

    vi.mocked(userAdapter.deleteCurrentUser).mockRejectedValueOnce(reauthErr);

    await expect(deleteCurrentUserUseCase()).rejects.toThrow('REAUTHENTICATION_REQUIRED');
  });
});
