import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../shared/i18n';

const m = vi.hoisted(() => ({ list: vi.fn(), embed: vi.fn() }));
vi.mock('../application/usecases/listPaymentAccountsUseCase', () => ({
  listPaymentAccountsUseCase: m.list,
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

describe('PartnerStripeConnectPortal (D14)', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.stubEnv('VITE_STRIPE_PUBLISHABLE_KEY', 'pk_test_x');
    await i18n.changeLanguage('pt-BR');
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
});
