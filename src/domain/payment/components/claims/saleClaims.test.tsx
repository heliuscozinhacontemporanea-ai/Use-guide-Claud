import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';

const m = vi.hoisted(() => ({ list: vi.fn(), open: vi.fn() }));
vi.mock('../../application/usecases/listMySaleClaimsUseCase', () => ({
  listMySaleClaimsUseCase: m.list,
}));
vi.mock('../../application/usecases/openSaleClaimUseCase', () => ({
  openSaleClaimUseCase: m.open,
}));

import type { BuyerSaleClaim, ClaimableSale } from '../../types/saleClaims';
import { isWithinClaimWindow } from '../../utils/claimWindow';
import { MySaleClaimsProvider } from './MySaleClaimsProvider';
import { SaleClaimAction } from './SaleClaimAction';

const HOUR = 3_600_000;
const now = Date.now();
const SALE: ClaimableSale = {
  referenceType: 'booking',
  referenceId: 'booking-1',
  serviceStartsAt: new Date(now - 3 * HOUR).toISOString(),
  serviceEndsAt: new Date(now - HOUR).toISOString(),
};
const CLAIM: BuyerSaleClaim = {
  id: 'booking_booking-1',
  referenceType: 'booking',
  referenceId: 'booking-1',
  reason: 'did_not_happen',
  status: 'open',
  openedAt: new Date(now).toISOString(),
  decideBy: new Date(now + 5 * 24 * HOUR).toISOString(),
};

function renderAction(sale: ClaimableSale = SALE) {
  return render(
    <MySaleClaimsProvider>
      <SaleClaimAction sale={sale} />
    </MySaleClaimsProvider>
  );
}

describe('relatar problema (D16, 2A)', () => {
  beforeEach(async () => {
    m.list.mockReset();
    m.open.mockReset();
    await i18n.changeLanguage('pt-BR');
  });

  it('janela: do início do serviço até 48 h depois do fim', () => {
    const at = (hours: number) => new Date(new Date(SALE.serviceEndsAt).getTime() + hours * HOUR);
    expect(isWithinClaimWindow(SALE, new Date(new Date(SALE.serviceStartsAt).getTime() - 1))).toBe(
      false
    );
    expect(isWithinClaimWindow(SALE, at(47))).toBe(true);
    expect(isWithinClaimWindow(SALE, at(49))).toBe(false);
  });

  it('sem reclamação, dentro do prazo: botão; envia o motivo e mostra o status', async () => {
    m.list.mockResolvedValue([]);
    m.open.mockResolvedValue(CLAIM);
    renderAction();
    fireEvent.click(await screen.findByRole('button', { name: 'Relatar problema' }));
    fireEvent.click(screen.getByRole('button', { name: 'Enviar relato' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Escolha o que aconteceu.');
    fireEvent.click(screen.getByLabelText('Não aconteceu'));
    fireEvent.click(screen.getByRole('button', { name: 'Enviar relato' }));
    await waitFor(() =>
      expect(m.open).toHaveBeenCalledWith({
        referenceType: 'booking',
        referenceId: 'booking-1',
        reason: 'did_not_happen',
      })
    );
    expect(await screen.findByText('Problema relatado.')).toBeInTheDocument();
  });

  it('erro da API pelo code', async () => {
    m.list.mockResolvedValue([]);
    m.open.mockRejectedValue(new Error('CLAIM_ALREADY_EXISTS'));
    renderAction();
    fireEvent.click(await screen.findByRole('button', { name: 'Relatar problema' }));
    fireEvent.click(screen.getByLabelText('Outro motivo'));
    fireEvent.click(screen.getByRole('button', { name: 'Enviar relato' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Você já relatou um problema nesta compra.'
    );
  });

  it('com reclamação: só o status, com o valor reembolsado', async () => {
    m.list.mockResolvedValue([{ ...CLAIM, status: 'refunded', refundAmountMinor: 12000 }]);
    renderAction();
    expect(await screen.findByText('Reembolsado.')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('R$');
    expect(screen.queryByRole('button', { name: 'Relatar problema' })).toBeNull();
  });

  it('fora do prazo e sem reclamação: nada', async () => {
    m.list.mockResolvedValue([]);
    const old = new Date(now - 72 * HOUR).toISOString();
    const { container } = renderAction({ ...SALE, serviceStartsAt: old, serviceEndsAt: old });
    await waitFor(() => expect(m.list).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });
});
