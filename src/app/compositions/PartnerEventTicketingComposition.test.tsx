import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../shared/i18n';

const m = vi.hoisted(() => ({ listing: vi.fn(), accounts: vi.fn() }));
vi.mock('../../domain/events', () => ({ getEventListingByIdUseCase: m.listing }));
vi.mock('../../domain/payment', () => ({
  listPaymentAccountsUseCase: m.accounts,
  PartnerStripeConnectPortal: () => <div>portal</div>,
  PaymentAccountNotice: ({ message }: { message: string }) => <p>{message}</p>,
}));
vi.mock('../../domain/ticketing', () => ({
  PartnerEventTicketingManager: ({ accountNotice }: { accountNotice?: React.ReactNode }) => (
    <div>{accountNotice}</div>
  ),
}));

import { PartnerEventTicketingComposition } from './PartnerEventTicketingComposition';

describe('PartnerEventTicketingComposition (B26: conta do estabelecimento do evento)', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await i18n.changeLanguage('pt-BR');
    m.listing.mockResolvedValue({ id: 'ev-1', establishmentId: 'bar-1' });
  });

  it('outro CNPJ pronto não libera o evento', async () => {
    m.accounts.mockResolvedValue([
      { accountKey: 'k1', itemIds: ['pousada-1'], account: { readyForSales: true } },
      { accountKey: 'k2', itemIds: ['bar-1'], account: { readyForSales: false } },
    ]);
    render(<PartnerEventTicketingComposition eventListingId="ev-1" />);
    expect(await screen.findByText(/Venda de ingressos pagos indisponível/)).toBeTruthy();
  });

  it('conta do estabelecimento do evento pronta: sem aviso', async () => {
    m.accounts.mockResolvedValue([
      { accountKey: 'k2', itemIds: ['bar-1'], account: { readyForSales: true } },
    ]);
    render(<PartnerEventTicketingComposition eventListingId="ev-1" />);
    await waitFor(() => expect(m.accounts).toHaveBeenCalled());
    expect(screen.queryByText(/Venda de ingressos pagos indisponível/)).toBeNull();
  });
});
