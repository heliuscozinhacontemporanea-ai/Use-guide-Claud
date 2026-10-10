import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../domain/partners', () => ({ getPartnerProfileUseCase: vi.fn() }));
vi.mock('./verifyPartnerApplicationUseCase', () => ({ verifyPartnerApplicationUseCase: vi.fn() }));

import { getPartnerProfileUseCase } from '../../domain/partners';
import { activatePaidPlanApplicationUseCase } from './activatePaidPlanApplicationUseCase';
import { verifyPartnerApplicationUseCase } from './verifyPartnerApplicationUseCase';

const NOW = new Date('2026-10-10T12:00:00.000Z');

function profileWithVerifiedUntil(verifiedUntil: string | null) {
  vi.mocked(getPartnerProfileUseCase).mockResolvedValueOnce({ verifiedUntil } as never);
}

describe('activatePaidPlanApplicationUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('monthly sem selo ativo concede 1 mês a partir de agora', async () => {
    profileWithVerifiedUntil(null);
    const { verifiedUntil } = await activatePaidPlanApplicationUseCase({
      partnerId: 'p1',
      planId: 'monthly',
      paymentReference: 'pi_1',
    });
    expect(verifiedUntil).toBe('2026-11-10T12:00:00.000Z');
    expect(verifyPartnerApplicationUseCase).toHaveBeenCalledWith('p1', true, verifiedUntil, 'monthly');
  });

  it('semi-annual com selo ativo soma 6 meses ao vencimento atual', async () => {
    profileWithVerifiedUntil('2026-10-20T12:00:00.000Z');
    const { verifiedUntil } = await activatePaidPlanApplicationUseCase({
      partnerId: 'p1',
      planId: 'semi-annual',
      paymentReference: 'pi_2',
    });
    expect(verifiedUntil).toBe('2027-04-20T12:00:00.000Z');
  });

  it('annual concede 12 meses', async () => {
    profileWithVerifiedUntil('2026-01-01T00:00:00.000Z');
    const { verifiedUntil } = await activatePaidPlanApplicationUseCase({
      partnerId: 'p1',
      planId: 'annual',
      paymentReference: 'pi_3',
    });
    expect(verifiedUntil).toBe('2027-10-10T12:00:00.000Z');
  });

  it('assinatura usa o fim do período + 2 dias de margem', async () => {
    const { verifiedUntil } = await activatePaidPlanApplicationUseCase({
      partnerId: 'p1',
      planId: 'monthly',
      paymentReference: 'in_1',
      subscriptionPeriodEnd: '2026-11-10T12:00:00.000Z',
    });
    expect(verifiedUntil).toBe('2026-11-12T12:00:00.000Z');
    expect(getPartnerProfileUseCase).not.toHaveBeenCalled();
  });

  it('recusa plano que não é pago', async () => {
    await expect(
      activatePaidPlanApplicationUseCase({ partnerId: 'p1', planId: 'trial', paymentReference: 'x' })
    ).rejects.toThrow(/Plano pago inválido/);
    expect(verifyPartnerApplicationUseCase).not.toHaveBeenCalled();
  });
});
