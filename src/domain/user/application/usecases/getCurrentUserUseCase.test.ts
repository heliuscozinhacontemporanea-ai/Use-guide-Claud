import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCurrentUserUseCase } from './getCurrentUserUseCase';
import { userAdapter } from '../../factory';

vi.mock('../../factory', () => ({
  userAdapter: {
    getCurrentUser: vi.fn(),
  },
}));

describe('getCurrentUserUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve retornar o perfil do usuário atual via userAdapter', async () => {
    const mockUser = {
      uid: 'user-abc',
      email: 'user@example.com',
      firstName: 'Lucas',
      lastName: 'Melo',
      phone: '85999999999',
      role: 'user',
    };
    vi.mocked(userAdapter.getCurrentUser).mockResolvedValueOnce(mockUser as any);

    const result = await getCurrentUserUseCase();
    expect(result).toEqual(mockUser);
    expect(userAdapter.getCurrentUser).toHaveBeenCalledTimes(1);
  });

  it('deve retornar null se o usuário não estiver logado', async () => {
    vi.mocked(userAdapter.getCurrentUser).mockResolvedValueOnce(null);

    const result = await getCurrentUserUseCase();
    expect(result).toBeNull();
  });
});
