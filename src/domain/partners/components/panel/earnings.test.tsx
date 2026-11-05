import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';
import type { PartnerEarnings, PartnerPayoutLine } from '../../types/partnerHome';

const m = vi.hoisted(() => ({ earnings: vi.fn() }));
vi.mock('../../application/usecases/getPartnerEarningsUseCase', () => ({
  getPartnerEarningsUseCase: m.earnings,
}));

import { PartnerEarningsTab } from './PartnerEarningsTab';

const line = (id: string, serviceEndsAt: string, netMinor: number): PartnerPayoutLine => ({
  id,
  title: 'Passeio de buggy',
  referenceType: 'booking',
  serviceEndsAt,
  grossMinor: Math.round(netMinor / 0.85),
  serviceFeeMinor: 0,
  refundedMinor: 0,
  platformFeeMinor: Math.round(netMinor / 0.85) - netMinor,
  offsetMinor: 0,
  netMinor,
});

const EARNINGS: PartnerEarnings = {
  toReceiveMinor: 1670000,
  receivedThisMonthMinor: 894000,
  accounts: { count: 2, ready: 2 },
  payouts: [
    {
      id: 'g1',
      status: 'scheduled',
      date: '2026-11-06T13:00:00.000Z',
      accountKey: 'acc1',
      account: { maskedDocument: 'CNPJ ••••/0001-81', name: 'Buggy do Preá' },
      amountMinor: 518000,
      holdReasons: [],
      lines: [
        line('a', '2026-11-03T15:00:00.000Z', 275400),
        line('b', '2026-11-04T15:00:00.000Z', 242600),
      ],
    },
    {
      id: 'g2',
      status: 'held',
      date: '2026-11-04T13:00:00.000Z',
      accountKey: 'acc1',
      account: { maskedDocument: 'CNPJ ••••/0001-81', name: 'Buggy do Preá' },
      amountMinor: 34000,
      holdReasons: ['claim'],
      lines: [{ ...line('c', '2026-11-02T15:00:00.000Z', 34000), title: 'Kitesurf' }],
    },
  ],
};

describe('Ganhos (p20, p21)', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
    vi.clearAllMocks();
    m.earnings.mockResolvedValue(EARNINGS);
  });

  it('mostra a receber, recebido no mês, repasses programados e a venda retida', async () => {
    render(
      <PartnerEarningsTab
        renders={{}}
        reports={null}
        showReports={false}
        showAccounts={false}
        onShowAccountsChange={vi.fn()}
        onShowReportsChange={vi.fn()}
      />
    );
    expect(await screen.findByText('em 2 repasses')).toBeTruthy();
    expect(screen.getByText('Passeio de buggy (3 de nov. e 4 de nov.)')).toBeTruthy();
    expect(screen.getByText('Cliente abriu reclamação')).toBeTruthy();
    expect(screen.getByText('Segurado até a decisão')).toBeTruthy();
    expect(screen.getByText('2 CNPJs · tudo certo')).toBeTruthy();
  });

  it('a folha do repasse mostra a conta, a taxa e cada venda', async () => {
    render(
      <PartnerEarningsTab
        renders={{}}
        reports={null}
        showReports={false}
        showAccounts={false}
        onShowAccountsChange={vi.fn()}
        onShowReportsChange={vi.fn()}
      />
    );
    fireEvent.click(await screen.findByRole('button', { name: /6 de nov\./ }));
    const sheet = await screen.findByRole('dialog');
    expect(within(sheet).getByText('Repasse de 6 de nov.')).toBeTruthy();
    expect(within(sheet).getByText(/Cai na conta de Buggy do Preá · CNPJ/)).toBeTruthy();
    expect(within(sheet).getByText(/Taxa do Use Guide \(15\s?%\)/)).toBeTruthy();
    expect(within(sheet).getAllByText(/Passeio de buggy · /)).toHaveLength(2);
  });

  it('Extrato, Dívidas e Contas usam o que a composição monta', async () => {
    const onShowAccounts = vi.fn();
    render(
      <PartnerEarningsTab
        renders={{
          renderStatement: () => <p>extrato</p>,
          renderDebts: () => <p>dívidas</p>,
          renderAccounts: () => <p>contas</p>,
        }}
        reports={null}
        showReports={false}
        showAccounts={false}
        onShowAccountsChange={onShowAccounts}
        onShowReportsChange={vi.fn()}
      />
    );
    fireEvent.click(await screen.findByRole('button', { name: 'Extrato' }));
    expect(screen.getByText('extrato')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Dívidas' }));
    expect(screen.getByText('dívidas')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Contas de recebimento/ }));
    expect(onShowAccounts).toHaveBeenCalledWith(true);
  });
});

it('Contas de recebimento aberta mostra o que a composição monta', async () => {
  render(
    <PartnerEarningsTab
      renders={{ renderAccounts: () => <p>contas</p> }}
      reports={null}
      showReports={false}
      onShowReportsChange={vi.fn()}
      showAccounts
      onShowAccountsChange={vi.fn()}
    />
  );
  expect(await screen.findByText('contas')).toBeTruthy();
});
