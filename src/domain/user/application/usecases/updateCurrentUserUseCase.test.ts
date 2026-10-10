import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateCurrentUserUseCase } from './updateCurrentUserUseCase';
import { userAdapter } from '../../factory';

vi.mock('../../factory', () => ({
  userAdapter: {
    updateCurrentUser: vi.fn(),
  },
}));

describe('updateCurrentUserUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve validar com Zod e chamar userAdapter.updateCurrentUser com dados válidos', async () => {
    const validData = {
      firstName: 'Marina',
      lastName: 'Lima',
      phone: '85988887777',
    };
    const expectedProfile = {
      uid: 'uid-xyz',
      email: 'marina@test.com',
      ...validData,
      role: 'user',
    };
    vi.mocked(userAdapter.updateCurrentUser).mockResolvedValueOnce(expectedProfile as any);

    const result = await updateCurrentUserUseCase(validData);
    expect(result).toEqual(expectedProfile);
    expect(userAdapter.updateCurrentUser).toHaveBeenCalledWith(validData);
  });

  it('deve falhar com Zod validation error se os dados forem inválidos', async () => {
    const invalidData = {
      firstName: 'x'.repeat(60), // max(50)
      lastName: 'Silva',
      phone: '123',
    };

    await expect(updateCurrentUserUseCase(invalidData as any)).rejects.toThrow();
    expect(userAdapter.updateCurrentUser).not.toHaveBeenCalled();
  });
});
