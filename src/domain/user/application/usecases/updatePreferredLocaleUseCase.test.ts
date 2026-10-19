import { beforeEach, describe, expect, it, vi } from 'vitest';
import { userAdapter } from '../../factory';
import { updatePreferredLocaleUseCase } from './updatePreferredLocaleUseCase';

vi.mock('../../factory', () => ({
  userAdapter: { updatePreferredLocale: vi.fn() },
}));

describe('updatePreferredLocaleUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('envia o idioma suportado para a conta', async () => {
    await updatePreferredLocaleUseCase('en');
    expect(userAdapter.updatePreferredLocale).toHaveBeenCalledWith('en');
  });

  it('recusa idioma não suportado', async () => {
    await expect(updatePreferredLocaleUseCase('es' as never)).rejects.toThrow();
    expect(userAdapter.updatePreferredLocale).not.toHaveBeenCalled();
  });
});
