import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminDomainError } from '../errors/adminDomainError';
import type { AdminPlansPort } from '../ports/adminPlansPort';
import { AdminPlansService } from './adminPlansService';

describe('AdminPlansService', () => {
  let port: AdminPlansPort;
  let service: AdminPlansService;

  beforeEach(() => {
    port = {
      updatePlan: vi.fn(),
      getPlans: vi.fn(),
      getPlanById: vi.fn(),
    };
    service = new AdminPlansService(port);
  });

  it('rejeita updatePlan quando planId for vazio', async () => {
    await expect(
      service.updatePlan('   ', { name: 'Novo Nome' })
    ).rejects.toThrow(AdminDomainError);
    expect(port.updatePlan).not.toHaveBeenCalled();
  });

  it('delega updatePlan para o port quando planId for válido', async () => {
    await service.updatePlan('monthly', {
      name: 'Plano Mensal',
      priceMinor: 4990,
      description: 'Acesso completo mensal',
    });

    expect(port.updatePlan).toHaveBeenCalledWith('monthly', {
      name: 'Plano Mensal',
      priceMinor: 4990,
      description: 'Acesso completo mensal',
    });
  });

  it('deriva o equivalente mensal (centavos) do preço para planos semestral e anual', async () => {
    await service.updatePlan('annual', { priceMinor: 29990 });
    await service.updatePlan('semi-annual', { priceMinor: 15000 });

    expect(port.updatePlan).toHaveBeenNthCalledWith(1, 'annual', {
      priceMinor: 29990,
      monthlyEquivalentMinor: 2499,
    });
    expect(port.updatePlan).toHaveBeenNthCalledWith(2, 'semi-annual', {
      priceMinor: 15000,
      monthlyEquivalentMinor: 2500,
    });
  });

  it('não altera o equivalente mensal quando o preço não muda ou o plano é mensal', async () => {
    await service.updatePlan('annual', { name: 'Anual Premium' });
    await service.updatePlan('monthly', { priceMinor: 4990 });

    expect(port.updatePlan).toHaveBeenNthCalledWith(1, 'annual', { name: 'Anual Premium' });
    expect(port.updatePlan).toHaveBeenNthCalledWith(2, 'monthly', { priceMinor: 4990 });
  });

  it('rejeita preço zero em plano pago, mas permite no trial', async () => {
    await expect(service.updatePlan('monthly', { priceMinor: 0 })).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    });
    expect(port.updatePlan).not.toHaveBeenCalled();

    await service.updatePlan('trial', { priceMinor: 0 });
    expect(port.updatePlan).toHaveBeenCalledWith('trial', { priceMinor: 0 });
  });

  it('retorna null em getPlanById quando planId for vazio', async () => {
    const plan = await service.getPlanById('  ');
    expect(plan).toBeNull();
    expect(port.getPlanById).not.toHaveBeenCalled();
  });

  it('delega getPlans e getPlanById para o port', async () => {
    vi.mocked(port.getPlans).mockResolvedValue([]);
    vi.mocked(port.getPlanById).mockResolvedValue({
      id: 'annual',
      name: 'Anual',
      priceMinor: 29900,
      period: '/ano',
      monthlyEquivalentMinor: 2492,
      savingLabel: 'Economize 20%',
      description: 'Plano anual',
      isActive: true,
    });

    await expect(service.getPlans()).resolves.toEqual([]);
    await expect(service.getPlanById('annual')).resolves.toMatchObject({
      id: 'annual',
      name: 'Anual',
    });
  });
});
