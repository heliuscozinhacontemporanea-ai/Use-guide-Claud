import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../domain/users', () => ({ getUserAuthorizationSnapshotUseCase: vi.fn() }));
vi.mock('../../domain/partners', () => ({ getPartnerProfileUseCase: vi.fn() }));

import { getPartnerProfileUseCase } from '../../domain/partners';
import { getUserAuthorizationSnapshotUseCase } from '../../domain/users';
import { resolveGuideUserContextApplicationUseCase } from './resolveGuideUserContextApplicationUseCase';

describe('resolveGuideUserContextApplicationUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('admin não consulta o perfil', async () => {
    const ctx = await resolveGuideUserContextApplicationUseCase({ uid: 'a', admin: true });
    expect(ctx.role).toBe('admin');
    expect(getUserAuthorizationSnapshotUseCase).not.toHaveBeenCalled();
  });

  it('parceiro ativo mantém o papel de parceiro', async () => {
    vi.mocked(getUserAuthorizationSnapshotUseCase).mockResolvedValue({ role: 'partner' });
    vi.mocked(getPartnerProfileUseCase).mockResolvedValue({ status: 'active' } as never);
    const ctx = await resolveGuideUserContextApplicationUseCase({ uid: 'p1' });
    expect(ctx.role).toBe('partner');
  });

  it('parceiro suspenso vira usuário comum e perde o acesso de parceiro', async () => {
    vi.mocked(getUserAuthorizationSnapshotUseCase).mockResolvedValue({ role: 'partner' });
    vi.mocked(getPartnerProfileUseCase).mockResolvedValue({ status: 'suspended' } as never);
    const ctx = await resolveGuideUserContextApplicationUseCase({ uid: 'p1' });
    expect(ctx.role).toBe('user');
  });

  it('usuário comum não consulta o cadastro de parceiro', async () => {
    vi.mocked(getUserAuthorizationSnapshotUseCase).mockResolvedValue({ role: 'user' });
    const ctx = await resolveGuideUserContextApplicationUseCase({ uid: 'u1' });
    expect(ctx.role).toBe('user');
    expect(getPartnerProfileUseCase).not.toHaveBeenCalled();
  });
});
