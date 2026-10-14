import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getIdTokenUseCase,
  hasPasswordSignInUseCase,
  logoutUseCase,
  reauthenticateUseCase,
  reauthenticateWithGoogleUseCase,
} from '../../../auth';
import { userAdapter } from '../../factory';
import { deleteCurrentUserUseCase } from './deleteCurrentUserUseCase';

vi.mock('../../factory', () => ({
  userAdapter: {
    deleteCurrentUser: vi.fn(),
  },
}));

vi.mock('../../../auth', () => ({
  reauthenticateUseCase: vi.fn(),
  reauthenticateWithGoogleUseCase: vi.fn(),
  hasPasswordSignInUseCase: vi.fn(),
  getIdTokenUseCase: vi.fn(),
  logoutUseCase: vi.fn(),
}));

describe('deleteCurrentUserUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(logoutUseCase).mockResolvedValue(undefined);
    vi.mocked(getIdTokenUseCase).mockResolvedValue('fresh-token');
  });

  it('conta com senha: reautentica com a senha, renova o token, exclui e desloga', async () => {
    vi.mocked(hasPasswordSignInUseCase).mockReturnValue(true);

    await deleteCurrentUserUseCase('test@example.com', 'ValidPass123!');

    expect(reauthenticateUseCase).toHaveBeenCalledWith('test@example.com', 'ValidPass123!');
    expect(reauthenticateWithGoogleUseCase).not.toHaveBeenCalled();
    expect(getIdTokenUseCase).toHaveBeenCalledWith(true);
    expect(userAdapter.deleteCurrentUser).toHaveBeenCalledTimes(1);
    expect(logoutUseCase).toHaveBeenCalledTimes(1);
  });

  it('conta só com Google: confirma pelo popup do Google, sem pedir senha', async () => {
    vi.mocked(hasPasswordSignInUseCase).mockReturnValue(false);

    await deleteCurrentUserUseCase('google@example.com');

    expect(reauthenticateWithGoogleUseCase).toHaveBeenCalledTimes(1);
    expect(reauthenticateUseCase).not.toHaveBeenCalled();
    expect(userAdapter.deleteCurrentUser).toHaveBeenCalledTimes(1);
  });

  it('conta com senha sem a senha informada: não exclui', async () => {
    vi.mocked(hasPasswordSignInUseCase).mockReturnValue(true);

    await expect(deleteCurrentUserUseCase('test@example.com')).rejects.toThrow(
      'REAUTHENTICATION_REQUIRED'
    );
    expect(userAdapter.deleteCurrentUser).not.toHaveBeenCalled();
  });

  it('popup do Google cancelado: não exclui', async () => {
    vi.mocked(hasPasswordSignInUseCase).mockReturnValue(false);
    vi.mocked(reauthenticateWithGoogleUseCase).mockRejectedValueOnce(
      Object.assign(new Error('closed'), { code: 'auth/popup-closed-by-user' })
    );

    await expect(deleteCurrentUserUseCase('google@example.com')).rejects.toThrow('closed');
    expect(userAdapter.deleteCurrentUser).not.toHaveBeenCalled();
  });
});
