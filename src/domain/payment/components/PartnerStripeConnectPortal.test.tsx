import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../shared/i18n';

const m = vi.hoisted(() => ({
  list: vi.fn(),
  embed: vi.fn(),
  terms: vi.fn(),
  accept: vi.fn(),
  debts: vi.fn(),
  payouts: vi.fn(),
}));
vi.mock('../application/usecases/getPartnerTermsUseCase', () => ({
  getPartnerTermsUseCase: m.terms,
}));
vi.mock('../application/usecases/acceptPartnerTermsUseCase', () => ({
  acceptPartnerTermsUseCase: m.accept,
}));
vi.mock('../application/usecases/listPaymentAccountsUseCase', () => ({
  listPaymentAccountsUseCase: m.list,
}));
vi.mock('../application/usecases/listDebtsUseCase', () => ({
  listDebtsUseCase: m.debts,
}));
vi.mock('../application/usecases/listPayoutsUseCase', () => ({
  listPayoutsUseCase: m.payouts,
}));
vi.mock('../application/usecases/createPaymentAccountSessionUseCase', () => ({
  createPaymentAccountSessionUseCase: vi.fn(),
}));
vi.mock('../adapters/ui/StripeConnectAccountEmbed', () => ({
  StripeConnectAccountEmbed: (props: { accountKey: string; section: string }) => {
    m.embed(props);
    return <div data-testid="connect-embed">{`${props.accountKey}:${props.section}`}</div>;
  },
}));
vi.mock('../../../shared/context/ThemeContext', () => ({
  useTheme: () => ({ resolvedTheme: 'dark' }),
}));

import { PartnerStripeConnectPortal } from './PartnerStripeConnectPortal';

const READY = {
  accountKey: 'key-1',
  maskedDocument: '**.***.***/0001-81',
  itemIds: ['item-1', 'item-3'],
  account: {
    status: 'enabled' as const,
    chargesEnabled: true,
    payoutsEnabled: true,
    detailsSubmitted: true,
    requirementsDueCount: 0,
    readyForSales: true,
  },
};
const NOT_STARTED = {
  accountKey: 'key-2',
  maskedDocument: '**.***.***/0001-61',
  itemIds: ['item-2'],
  account: null,
};

const PENDING_TERMS = {
  currentVersion: '2026-10-25',
  accepted: false,
  acceptedAt: null,
  fees: {
    bookingsBps: 1500,
    ticketsBps: 1000,
    ticketsAbsorbedBps: 1250,
    ticketServiceFeeMinor: 300,
  },
};
const ACCEPTED_TERMS = { ...PENDING_TERMS, accepted: true, acceptedAt: '2026-10-25T15:00:00.000Z' };

describe('PartnerStripeConnectPortal (D14)', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.stubEnv('VITE_STRIPE_PUBLISHABLE_KEY', 'pk_test_x');
    await i18n.changeLanguage('pt-BR');
    m.terms.mockResolvedValue(ACCEPTED_TERMS);
    m.debts.mockResolvedValue([]);
    m.payouts.mockResolvedValue({ data: [], nextCursor: null });
  });

  it('mostra um cartão por CNPJ com o status de cada conta', async () => {
    m.list.mockResolvedValue([READY, NOT_STARTED]);
    render(<PartnerStripeConnectPortal />);
    expect(await screen.findByText('**.***.***/0001-81')).toBeTruthy();
    expect(screen.getByText('2 cadastros vendem por este CNPJ')).toBeTruthy();
    expect(screen.getByText('Pronta para receber')).toBeTruthy();
    expect(screen.getByText('Cadastro não iniciado')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Configurar recebimentos/ })).toBeTruthy();
  });

  it('abre o cadastro da conta escolhida, sem misturar CNPJs', async () => {
    m.list.mockResolvedValue([READY, NOT_STARTED]);
    render(<PartnerStripeConnectPortal />);
    fireEvent.click(await screen.findByRole('button', { name: /Configurar recebimentos/ }));
    expect(screen.getByTestId('connect-embed').textContent).toBe('key-2:onboarding');
    // Conta sem cadastro só mostra o cadastro: saldos e repasses ainda não existem.
    expect(screen.queryByRole('button', { name: 'Saldos' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /Voltar para as contas/ }));
    fireEvent.click(screen.getByRole('button', { name: /Gerenciar/ }));
    expect(screen.getByTestId('connect-embed').textContent).toBe('key-1:balances');
  });

  it('sem CNPJ verificado: explica o que fazer', async () => {
    m.list.mockResolvedValue([]);
    render(<PartnerStripeConnectPortal />);
    expect(await screen.findByText(/Nenhum CNPJ verificado ainda/)).toBeTruthy();
  });

  it('erro da API: mensagem traduzida pelo código e botão de tentar de novo', async () => {
    m.list.mockRejectedValueOnce(new Error('PAYMENT_ACCOUNT_UNAVAILABLE'));
    m.list.mockResolvedValueOnce([READY]);
    render(<PartnerStripeConnectPortal />);
    expect(await screen.findByText(/Não foi possível falar com o Stripe/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));
    await waitFor(() => expect(screen.getByText('Pronta para receber')).toBeTruthy());
  });

  it('sem os termos do parceiro aceitos, a conta nova não começa (D15)', async () => {
    m.list.mockResolvedValue([NOT_STARTED]);
    m.terms.mockResolvedValue(PENDING_TERMS);
    m.accept.mockResolvedValue(ACCEPTED_TERMS);
    render(<PartnerStripeConnectPortal />);
    const start = await screen.findByRole('button', { name: /Configurar recebimentos/ });
    expect((start as HTMLButtonElement).disabled).toBe(true);
    const acceptButton = screen.getByRole('button', { name: 'Aceitar termos' });
    expect((acceptButton as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(acceptButton);
    await waitFor(() => expect(m.accept).toHaveBeenCalledWith('2026-10-25'));
    expect(await screen.findByText(/Termos do parceiro aceitos em/)).toBeTruthy();
    expect((start as HTMLButtonElement).disabled).toBe(false);
  });

  it('dívida vencida: aviso de vendas pausadas e contador na aba Dívidas (D16)', async () => {
    m.list.mockResolvedValue([READY]);
    m.debts.mockResolvedValue([
      {
        id: 'debt-1',
        accountKey: 'key-1',
        reason: 'cancellation_penalty',
        referenceType: 'event_occurrence',
        amountMinor: 2000,
        remainingMinor: 2000,
        status: 'open',
        dueAt: '2026-10-20T12:00:00.000Z',
        overdue: true,
        createdAt: '2026-10-19T12:00:00.000Z',
      },
    ]);
    render(<PartnerStripeConnectPortal />);
    expect(await screen.findByText(/Vendas pausadas/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Dívidas/ }));
    expect(await screen.findByText('Multa de cancelamento (20% do vendido)')).toBeTruthy();
    expect(screen.getByText('Vencida: as vendas deste CNPJ estão pausadas.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Pagar' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Declarar força maior' })).toBeNull();
  });

  it('extrato: status e valores de cada venda', async () => {
    m.list.mockResolvedValue([READY]);
    m.payouts.mockResolvedValue({
      data: [
        {
          id: 'po_1',
          referenceType: 'ticket_order',
          referenceId: 'ord_1',
          title: 'Festival de Verão',
          accountKey: 'key-1',
          grossMinor: 10600,
          refundedMinor: 0,
          partnerAmountMinor: 9000,
          offsetMinor: 0,
          status: 'on_hold',
          holdReasons: ['claim'],
          serviceEndsAt: '2026-12-21T03:00:00.000Z',
          releaseAt: '2026-12-23T03:00:00.000Z',
          releasedAt: null,
          canceledReason: null,
          createdAt: '2026-12-01T00:00:00.000Z',
        },
      ],
      nextCursor: null,
    });
    render(<PartnerStripeConnectPortal />);
    await screen.findByText('**.***.***/0001-81');
    fireEvent.click(screen.getByRole('button', { name: 'Extrato' }));
    expect(await screen.findByText('Festival de Verão')).toBeTruthy();
    expect(screen.getByText('Retido: reclamação em análise')).toBeTruthy();
    expect(screen.getByText(/90,00/)).toBeTruthy();
  });
});
