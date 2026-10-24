import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';

const m = vi.hoisted(() => ({
  get: vi.fn(),
  setSeal: vi.fn(),
  confirm: vi.fn(),
  toast: vi.fn(),
}));
vi.mock('../../application/usecases/getListingPlanUseCase', () => ({
  getListingPlanUseCase: m.get,
}));
vi.mock('../../application/usecases/activateListingTrialUseCase', () => ({
  activateListingTrialUseCase: vi.fn(),
}));
vi.mock('../../application/usecases/setListingSealUseCase', () => ({
  setListingSealUseCase: m.setSeal,
}));
vi.mock('../../../../shared/stores/useUIStore', () => ({
  useUI: () => ({ showToast: m.toast, confirmAction: m.confirm }),
}));

import { AdminListingSealControl } from './AdminListingSealControl';

const SEAL = {
  isVerified: true,
  verifiedUntil: null,
  verificationType: 'admin',
  isVerificationSuspended: false,
};
const NO_PLAN = {
  itemId: 'item-1',
  planType: null,
  planUntil: null,
  planActive: false,
  sealSuspended: false,
  seal: { ...SEAL, isVerified: false, verificationType: null },
  trialAvailable: true,
};

describe('AdminListingSealControl (D8, D11)', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await i18n.changeLanguage('pt-BR');
  });

  it('concede o selo depois da confirmação e relê o plano', async () => {
    m.get.mockResolvedValue(NO_PLAN);
    m.confirm.mockResolvedValue(true);
    m.setSeal.mockResolvedValue({ ...NO_PLAN, planType: 'admin', planActive: true, seal: SEAL });
    render(<AdminListingSealControl itemId="item-1" name="Pousada Sol" />);
    fireEvent.click(await screen.findByRole('button', { name: 'Conceder selo a Pousada Sol' }));
    await waitFor(() => expect(m.setSeal).toHaveBeenCalledWith('item-1', true));
    expect(m.confirm).toHaveBeenCalledWith(
      expect.stringContaining('Pousada Sol'),
      expect.objectContaining({ tone: 'positive' })
    );
    await waitFor(() => expect(m.toast).toHaveBeenCalledWith('Selo concedido.', 'success'));
    expect(m.get).toHaveBeenCalledTimes(2);
  });

  it('retirar o selo pede confirmação de risco e não chama a API se cancelar', async () => {
    m.get.mockResolvedValue({ ...NO_PLAN, planType: 'annual', planActive: true, seal: SEAL });
    m.confirm.mockResolvedValue(false);
    render(<AdminListingSealControl itemId="item-1" name="Pousada Sol" />);
    fireEvent.click(await screen.findByRole('button', { name: 'Retirar selo de Pousada Sol' }));
    await waitFor(() =>
      expect(m.confirm).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ tone: 'danger' })
      )
    );
    expect(m.setSeal).not.toHaveBeenCalled();
  });
});
