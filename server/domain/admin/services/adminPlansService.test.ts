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
      price: 49.9,
      description: 'Acesso completo mensal',
    });

    expect(port.updatePlan).toHaveBeenCalledWith('monthly', {
      name: 'Plano Mensal',
      price: 49.9,
      description: 'Acesso completo mensal',
    });
  });

  it('deriva monthlyEquivalent do preço para planos semestral e anual', async () => {
    await service.updatePlan('annual', { price: 299.9 });
    await service.updatePlan('semi-annual', { price: 150 });

    expect(port.updatePlan).toHaveBeenNthCalledWith(1, 'annual', {
      price: 299.9,
      monthlyEquivalent: 24.99,
    });
    expect(port.updatePlan).toHaveBeenNthCalledWith(2, 'semi-annual', {
      price: 150,
      monthlyEquivalent: 25,
    });
  });

  it('não altera monthlyEquivalent quando o preço não muda ou o plano é mensal', async () => {
    await service.updatePlan('annual', { name: 'Anual Premium' });
    await service.updatePlan('monthly', { price: 49.9 });

    expect(port.updatePlan).toHaveBeenNthCalledWith(1, 'annual', { name: 'Anual Premium' });
    expect(port.updatePlan).toHaveBeenNthCalledWith(2, 'monthly', { price: 49.9 });
  });

  it('rejeita preço zero em plano pago, mas permite no trial', async () => {
    await expect(service.updatePlan('monthly', { price: 0 })).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    });
    expect(port.updatePlan).not.toHaveBeenCalled();

    await service.updatePlan('trial', { price: 0 });
    expect(port.updatePlan).toHaveBeenCalledWith('trial', { price: 0 });
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
      price: 299,
      period: '/ano',
      monthlyEquivalent: 24.9,
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
