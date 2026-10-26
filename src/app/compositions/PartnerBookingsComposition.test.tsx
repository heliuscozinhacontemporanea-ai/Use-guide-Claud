import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../shared/i18n';

const m = vi.hoisted(() => ({ accounts: vi.fn(), manager: vi.fn() }));
vi.mock('../../domain/payment', () => ({
  listPaymentAccountsUseCase: m.accounts,
  PartnerStripeConnectPortal: () => <div>portal</div>,
}));
vi.mock('../../domain/bookings', () => ({
  isBookableCategory: (category: string) => category === 'tour' || category === 'sight',
  PartnerOffersManager: (props: {
    canPublish: (id: string) => boolean;
    accountNotice?: React.ReactNode;
  }) => {
    m.manager(props);
    return <div>{props.accountNotice}</div>;
  },
}));

import { PartnerBookingsComposition } from './PartnerBookingsComposition';

const ITEMS = [
  { id: 'tour-1', name: 'Buggy', category: 'tour' },
  { id: 'tour-2', name: 'Lagoa', category: 'tour' },
  { id: 'rest-1', name: 'Restaurante', category: 'restaurant' },
];

describe('PartnerBookingsComposition (B26: conta por estabelecimento)', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await i18n.changeLanguage('pt-BR');
  });

  it('publicar depende da conta do CNPJ de cada estabelecimento', async () => {
    m.accounts.mockResolvedValue([
      { accountKey: 'k1', itemIds: ['tour-1'], account: { readyForSales: true } },
      { accountKey: 'k2', itemIds: ['tour-2'], account: { readyForSales: false } },
    ]);
    render(<PartnerBookingsComposition items={ITEMS as never} />);
    expect(await screen.findByText(/Alguns estabelecimentos ainda não podem vender/)).toBeTruthy();
    const { canPublish } = m.manager.mock.calls.at(-1)?.[0] ?? {};
    expect(canPublish('tour-1')).toBe(true);
    expect(canPublish('tour-2')).toBe(false);
  });

  it('restaurante sem conta não gera aviso: só passeios e atrações vendem', async () => {
    m.accounts.mockResolvedValue([
      { accountKey: 'k1', itemIds: ['tour-1', 'tour-2'], account: { readyForSales: true } },
    ]);
    render(<PartnerBookingsComposition items={ITEMS as never} />);
    await waitFor(() => expect(m.accounts).toHaveBeenCalled());
    await waitFor(() => expect(m.manager.mock.calls.at(-1)?.[0].canPublish('tour-2')).toBe(true));
    expect(screen.queryByText('portal')).toBeNull();
  });
});
