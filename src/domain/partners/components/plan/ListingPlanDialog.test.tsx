import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';

const m = vi.hoisted(() => ({ getPlan: vi.fn(), trial: vi.fn(), getVerification: vi.fn() }));
vi.mock('../../../media', () => ({ uploadVerificationFileUseCase: vi.fn() }));
vi.mock('../../application/usecases/getListingPlanUseCase', () => ({
  getListingPlanUseCase: m.getPlan,
}));
vi.mock('../../application/usecases/activateListingTrialUseCase', () => ({
  activateListingTrialUseCase: m.trial,
}));
vi.mock('../../application/usecases/getListingVerificationUseCase', () => ({
  getListingVerificationUseCase: m.getVerification,
}));
vi.mock('../../application/usecases/submitListingVerificationUseCase', () => ({
  submitListingVerificationUseCase: vi.fn(),
}));

import type { SubscriptionPlan } from '../../types/partner';
import { ListingPlanDialog } from './ListingPlanDialog';

const LISTING = { id: 'item-1', name: 'Pousada Sol' };
const PLANS = [
  {
    id: 'annual',
    name: 'Anual',
    priceMinor: 49900,
    period: '/ano',
    monthlyEquivalentMinor: 4158,
    savingLabel: null,
    description: '',
    isActive: true,
  },
] as SubscriptionPlan[];
const NO_PLAN = {
  itemId: 'item-1',
  planType: null,
  planUntil: null,
  planActive: false,
  sealSuspended: false,
  seal: {
    isVerified: false,
    verifiedUntil: null,
    verificationType: null,
    isVerificationSuspended: false,
  },
  trialAvailable: true,
};

function renderDialog() {
  const props = { onClose: vi.fn(), onVerify: vi.fn(), onSelectPaidPlan: vi.fn() };
  render(<ListingPlanDialog listing={LISTING} plans={PLANS} {...props} />);
  return props;
}

describe('ListingPlanDialog (D11)', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await i18n.changeLanguage('pt-BR');
    m.getPlan.mockResolvedValue(NO_PLAN);
  });

  it('estabelecimento sem verificação aprovada não mostra planos e leva à verificação', async () => {
    m.getVerification.mockResolvedValue({ itemId: 'item-1', status: 'pending' });
    const props = renderDialog();
    fireEvent.click(await screen.findByRole('button', { name: /Verificar estabelecimento/ }));
    expect(props.onVerify).toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: /Anual/ })).toBeNull();
  });

  it('verificado escolhe o período pago e segue para o pagamento com o itemId', async () => {
    m.getVerification.mockResolvedValue({ itemId: 'item-1', status: 'approved' });
    const props = renderDialog();
    fireEvent.click(await screen.findByRole('button', { name: /Anual/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Seguir para o pagamento' }));
    expect(props.onSelectPaidPlan).toHaveBeenCalledWith({
      itemId: 'item-1',
      planId: 'annual',
      itemName: 'Use Guide Verificado · Anual · Pousada Sol',
      amountMinor: 49900,
    });
  });

  it('teste grátis ativa no estabelecimento', async () => {
    m.getVerification.mockResolvedValue({ itemId: 'item-1', status: 'approved' });
    m.trial.mockResolvedValue({ ...NO_PLAN, planType: 'trial', planActive: true });
    renderDialog();
    fireEvent.click(await screen.findByRole('button', { name: /Teste grátis de 7 dias/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Ativar 7 dias grátis' }));
    await screen.findByText(/Plano Teste grátis em vigor/);
    expect(m.trial).toHaveBeenCalledWith('item-1');
  });
});
