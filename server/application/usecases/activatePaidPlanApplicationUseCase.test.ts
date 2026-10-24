import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  applyPaid: vi.fn(),
  planUntil: vi.fn(),
  load: vi.fn(),
  sync: vi.fn(),
}));

vi.mock('../../domain/partners', () => ({
  applyListingPaidPlanUseCase: mocks.applyPaid,
  getListingPlanUntilUseCase: mocks.planUntil,
  isPaidListingPlanType: (value: string) =>
    value === 'monthly' || value === 'semi-annual' || value === 'annual',
}));
vi.mock('./listingPlans/loadPlanListing', () => ({ loadPlanListing: mocks.load }));
vi.mock('./listingPlans/syncListingSealApplicationUseCase', () => ({
  syncListingSealApplicationUseCase: mocks.sync,
}));

import { activatePaidPlanApplicationUseCase } from './activatePaidPlanApplicationUseCase';

const NOW = new Date('2026-10-10T12:00:00.000Z');
const listing = { id: 'item-1', ownerId: 'p1' };

describe('activatePaidPlanApplicationUseCase (D11)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    mocks.load.mockResolvedValue(listing);
    mocks.planUntil.mockResolvedValue(null);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('pagamento avulso sem plano concede o período a partir de agora e recalcula o selo', async () => {
    const { verifiedUntil } = await activatePaidPlanApplicationUseCase({
      itemId: 'item-1',
      partnerId: 'p1',
      planId: 'monthly',
      paymentReference: 'pi_1',
    });
    expect(verifiedUntil).toBe('2026-11-10T12:00:00.000Z');
    expect(mocks.applyPaid).toHaveBeenCalledWith(listing, 'monthly', verifiedUntil);
    expect(mocks.sync).toHaveBeenCalledWith('item-1');
  });

  it('renovação antecipada soma ao vencimento atual do estabelecimento', async () => {
    mocks.planUntil.mockResolvedValue('2026-10-20T12:00:00.000Z');
    const { verifiedUntil } = await activatePaidPlanApplicationUseCase({
      itemId: 'item-1',
      partnerId: 'p1',
      planId: 'semi-annual',
      paymentReference: 'pi_2',
    });
    expect(verifiedUntil).toBe('2027-04-20T12:00:00.000Z');
  });

  it('assinatura usa o fim do período mais 2 dias de folga', async () => {
    const { verifiedUntil } = await activatePaidPlanApplicationUseCase({
      itemId: 'item-1',
      partnerId: 'p1',
      planId: 'annual',
      paymentReference: 'in_1',
      subscriptionPeriodEnd: '2027-10-10T12:00:00.000Z',
    });
    expect(verifiedUntil).toBe('2027-10-12T12:00:00.000Z');
    expect(mocks.planUntil).not.toHaveBeenCalled();
  });

  it('recusa plano inválido e estabelecimento de outro dono', async () => {
    await expect(
      activatePaidPlanApplicationUseCase({
        itemId: 'item-1',
        partnerId: 'p1',
        planId: 'trial',
        paymentReference: 'x',
      })
    ).rejects.toThrow('Plano pago inválido');
    await expect(
      activatePaidPlanApplicationUseCase({
        itemId: 'item-1',
        partnerId: 'p2',
        planId: 'monthly',
        paymentReference: 'x',
      })
    ).rejects.toThrow('não pertence');
    expect(mocks.applyPaid).not.toHaveBeenCalled();
  });
});
