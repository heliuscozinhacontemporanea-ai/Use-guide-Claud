import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../domain/partners', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../domain/partners')>()),
  registerPartnerUseCase: vi.fn(),
  deletePartnerProfileUseCase: vi.fn(),
}));
vi.mock('../../domain/users', () => ({ upgradeUserToPartnerUseCase: vi.fn() }));

import { registerPartnerUseCase } from '../../domain/partners';
import type { PartnerRegistrationData } from '../../domain/partners';
import { upgradeUserToPartnerUseCase } from '../../domain/users';
import { registerPartnerApplicationUseCase } from './registerPartnerApplicationUseCase';

const DATA = {} as PartnerRegistrationData;

describe('registerPartnerApplicationUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('recusa conta sem e-mail confirmado antes de gravar qualquer coisa', async () => {
    await expect(
      registerPartnerApplicationUseCase({ uid: 'u1', emailVerified: false }, DATA)
    ).rejects.toMatchObject({ code: 'EMAIL_NOT_VERIFIED' });
    expect(registerPartnerUseCase).not.toHaveBeenCalled();
    expect(upgradeUserToPartnerUseCase).not.toHaveBeenCalled();
  });

  it('cadastra quem confirmou o e-mail', async () => {
    vi.mocked(registerPartnerUseCase).mockResolvedValue({ created: true } as never);
    await registerPartnerApplicationUseCase({ uid: 'u1', emailVerified: true }, DATA);
    expect(registerPartnerUseCase).toHaveBeenCalledWith('u1', DATA);
    expect(upgradeUserToPartnerUseCase).toHaveBeenCalledWith('u1');
  });
});
