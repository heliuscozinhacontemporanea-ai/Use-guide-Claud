import { beforeEach, describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({ setup: vi.fn(), profiles: vi.fn() }));
vi.mock('../../../domain/guide', () => ({ getGuideListingSetupUseCase: m.setup }));
vi.mock('../../../domain/users', () => ({ getUserProfilesBatchUseCase: m.profiles }));

import { getAdminListingApplicationUseCase } from './getAdminListingApplicationUseCase';

const steps = [{ id: 'name', done: true, missing: [] }];

describe('getAdminListingApplicationUseCase (F4)', () => {
  beforeEach(() => {
    m.setup.mockReset();
    m.profiles.mockReset();
  });

  it('anúncio do Use Guide: dono Use Guide, sem ler perfil de ninguém', async () => {
    m.setup.mockResolvedValue({
      ownerId: 'useguide',
      publication: 'draft',
      setupSteps: steps,
      publishSteps: steps,
    });
    expect(await getAdminListingApplicationUseCase('item-1')).toEqual({
      publication: 'draft',
      setupSteps: steps,
      publishSteps: steps,
      owner: { kind: 'useguide' },
    });
    expect(m.profiles).not.toHaveBeenCalled();
  });

  it('anúncio de parceiro: o nome do dono, sem o uid na resposta', async () => {
    m.setup.mockResolvedValue({
      ownerId: 'partner-1',
      publication: 'published',
      setupSteps: steps,
      publishSteps: steps,
    });
    m.profiles.mockResolvedValue({ 'partner-1': { firstName: 'Carla', lastName: 'Dias' } });
    const view = await getAdminListingApplicationUseCase('item-1');
    expect(view?.owner).toEqual({ kind: 'partner', name: 'Carla Dias' });
    expect(JSON.stringify(view)).not.toContain('partner-1');
  });

  it('anúncio inexistente: null', async () => {
    m.setup.mockResolvedValue(null);
    expect(await getAdminListingApplicationUseCase('x')).toBeNull();
  });
});
