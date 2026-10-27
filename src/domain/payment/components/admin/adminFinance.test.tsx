import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';

const m = vi.hoisted(() => ({ decide: vi.fn(), debts: vi.fn(), waive: vi.fn() }));
vi.mock('../../application/usecases/decideSaleClaimUseCase', () => ({
  decideSaleClaimUseCase: m.decide,
}));
vi.mock('../../application/usecases/listAdminAccountDebtsUseCase', () => ({
  listAdminAccountDebtsUseCase: m.debts,
}));
vi.mock('../../application/usecases/waiveAccountDebtUseCase', () => ({
  waiveAccountDebtUseCase: m.waive,
}));

import type { AdminAccountDebt, AdminSaleClaim } from '../../types/adminFinance';
import { AdminDebtQueue } from './AdminDebtQueue';
import { SaleClaimDecisionDialog } from './SaleClaimDecisionDialog';

const CLAIM: AdminSaleClaim = {
  id: 'booking_b1',
  referenceType: 'booking',
  referenceId: 'b1',
  reason: 'did_not_happen',
  status: 'open',
  openedAt: '2026-10-26T10:00:00.000Z',
  decideBy: '2026-10-31T10:00:00.000Z',
  buyerUid: 'buyer-1',
  title: 'Passeio de buggy',
  grossMinor: 10600,
  refundableMinor: 10600,
  maxPartialRefundMinor: 10000,
  sellerName: 'Buggy do Preá',
  maskedDocument: '**.***.***/0001-81',
};

const DEBT: AdminAccountDebt = {
  id: 'debt-1',
  accountKey: 'key-1',
  reason: 'cancellation_penalty',
  referenceType: 'booking_slot',
  amountMinor: 2000,
  remainingMinor: 2000,
  status: 'open',
  dueAt: '2026-10-27T12:00:00.000Z',
  overdue: true,
  createdAt: '2026-10-26T12:00:00.000Z',
  sellerName: 'Buggy do Preá',
  maskedDocument: '**.***.***/0001-81',
};

function renderDialog(claim: AdminSaleClaim = CLAIM) {
  const onDecided = vi.fn();
  render(<SaleClaimDecisionDialog claim={claim} onClose={vi.fn()} onDecided={onDecided} />);
  return onDecided;
}

describe('filas financeiras do admin (D16)', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await i18n.changeLanguage('pt-BR');
  });

  it('multa só no serviço que não aconteceu com reembolso integral', async () => {
    m.decide.mockResolvedValue(undefined);
    const onDecided = renderDialog();
    expect(screen.queryByText('Multa de 20% ao parceiro')).toBeNull();
    fireEvent.click(screen.getByLabelText(/Reembolso total/));
    fireEvent.click(screen.getByLabelText(/Multa de 20% ao parceiro/));
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar decisão' }));
    await waitFor(() =>
      expect(m.decide).toHaveBeenCalledWith('booking_b1', {
        outcome: 'refund_full',
        chargePenalty: true,
      })
    );
    expect(onDecided).toHaveBeenCalledWith('Reembolso integral pedido ao meio de pagamento.');
  });

  it('outro motivo: sem a opção de multa', () => {
    renderDialog({ ...CLAIM, reason: 'not_as_described' });
    fireEvent.click(screen.getByLabelText(/Reembolso total/));
    expect(screen.queryByText('Multa de 20% ao parceiro')).toBeNull();
  });

  it('parcial acima do teto é recusado antes de enviar', async () => {
    renderDialog();
    fireEvent.click(screen.getByLabelText(/Reembolso parcial/));
    fireEvent.change(screen.getByLabelText('Valor do reembolso'), {
      target: { value: '10001' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar decisão' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Informe um valor de até');
    expect(m.decide).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('Valor do reembolso'), { target: { value: '5000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar decisão' }));
    await waitFor(() =>
      expect(m.decide).toHaveBeenCalledWith('booking_b1', {
        outcome: 'refund_partial',
        amountMinor: 5000,
      })
    );
  });

  it('erro da decisão pelo code', async () => {
    m.decide.mockRejectedValue(new Error('CLAIM_ALREADY_DECIDED'));
    renderDialog();
    fireEvent.click(screen.getByLabelText(/Liberar o repasse/));
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar decisão' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Esta reclamação já foi decidida.');
  });

  it('perdoar dívida pede confirmação e recarrega a lista', async () => {
    m.debts.mockResolvedValueOnce({ data: [DEBT], nextCursor: null });
    m.debts.mockResolvedValueOnce({ data: [], nextCursor: null });
    m.waive.mockResolvedValue(undefined);
    const onNotice = vi.fn();
    render(<AdminDebtQueue onNotice={onNotice} />);
    expect(await screen.findByText(/Buggy do Preá/)).toBeInTheDocument();
    expect(screen.getByText(/Vencida desde/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Perdoar' }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Perdoar dívida' }));
    await waitFor(() => expect(m.waive).toHaveBeenCalledWith('debt-1'));
    expect(onNotice).toHaveBeenCalledWith('Dívida perdoada.');
    expect(await screen.findByText('Nenhuma dívida em aberto.')).toBeInTheDocument();
  });
});
