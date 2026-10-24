import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../shared/i18n';

const m = vi.hoisted(() => ({ get: vi.fn(), change: vi.fn() }));
vi.mock('../application/usecases/getPlanSubscriptionUseCase', () => ({
  getPlanSubscriptionUseCase: m.get,
}));
vi.mock('../application/usecases/changePlanSubscriptionUseCase', () => ({
  changePlanSubscriptionUseCase: m.change,
}));
vi.mock('../application/usecases/setPlanSubscriptionRenewalUseCase', () => ({
  setPlanSubscriptionRenewalUseCase: vi.fn(),
}));
vi.mock('../application/usecases/createBillingPortalSessionUseCase', () => ({
  createBillingPortalSessionUseCase: vi.fn(),
}));

import { PlanSubscriptionCard } from './PlanSubscriptionCard';

const PLANS = [
  { id: 'monthly' as const, name: 'Mensal', priceMinor: 4990 },
  { id: 'annual' as const, name: 'Anual', priceMinor: 49900 },
];
const ACTIVE = {
  itemId: 'item-1',
  planId: 'monthly' as const,
  status: 'active' as const,
  currentPeriodEnd: '2026-11-24T15:00:00.000Z',
  cancelAtPeriodEnd: false,
  pendingPlanId: null,
  pendingChangeAt: null,
};

describe('PlanSubscriptionCard (D13)', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await i18n.changeLanguage('pt-BR');
  });

  it('avisa a assinatura viva e troca o período na próxima renovação', async () => {
    m.get.mockResolvedValue(ACTIVE);
    m.change.mockResolvedValue({
      ...ACTIVE,
      pendingPlanId: 'annual',
      pendingChangeAt: '2026-11-24T15:00:00.000Z',
    });
    const onLiveChange = vi.fn();
    render(<PlanSubscriptionCard itemId="item-1" plans={PLANS} onLiveChange={onLiveChange} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Trocar período' }));
    await waitFor(() => expect(onLiveChange).toHaveBeenLastCalledWith(true));
    fireEvent.click(screen.getByRole('button', { name: /Anual/ }));
    fireEvent.click(screen.getByRole('button', { name: /Trocar na próxima renovação/ }));
    expect(await screen.findByText(/o plano passa para Anual/)).toBeTruthy();
    expect(m.change).toHaveBeenCalledWith(
      expect.objectContaining({ itemId: 'item-1', planId: 'annual' })
    );
  });

  it('troca agendada pode ser desfeita mantendo o período atual', async () => {
    m.get.mockResolvedValue({
      ...ACTIVE,
      pendingPlanId: 'annual',
      pendingChangeAt: '2026-11-24T15:00:00.000Z',
    });
    m.change.mockResolvedValue(ACTIVE);
    render(<PlanSubscriptionCard itemId="item-1" plans={PLANS} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Manter o período atual' }));
    await waitFor(() =>
      expect(m.change).toHaveBeenCalledWith(
        expect.objectContaining({ itemId: 'item-1', planId: 'monthly' })
      )
    );
  });

  it('sem assinatura não renderiza nada e avisa que não há assinatura viva', async () => {
    m.get.mockResolvedValue(null);
    const onLiveChange = vi.fn();
    const { container } = render(
      <PlanSubscriptionCard itemId="item-1" plans={PLANS} onLiveChange={onLiveChange} />
    );
    await waitFor(() => expect(onLiveChange).toHaveBeenCalledWith(false));
    expect(container.textContent).toBe('');
  });
});
