import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';

const m = vi.hoisted(() => ({ reports: vi.fn() }));
vi.mock('../../application/usecases/getPartnerReportsUseCase', () => ({
  getPartnerReportsUseCase: m.reports,
}));

import { PartnerReportsPage } from './PartnerReportsPage';

describe('Relatórios (p23)', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
    vi.clearAllMocks();
    m.reports.mockImplementation(async (period: string) => ({
      period,
      soldMinor: period === '7d' ? 500000 : 4138000,
      buckets: [
        { start: '2026-11-07T03:00:00.000Z', soldMinor: 1000 },
        { start: '2026-11-08T03:00:00.000Z', soldMinor: 2000 },
      ],
      items: [
        {
          key: 'booking|Passeio',
          title: 'Passeio de buggy ao Preá',
          referenceType: 'booking',
          soldMinor: 2628000,
          sales: 73,
          tickets: 0,
          promoterTickets: 0,
          people: 146,
          groups: 0,
        },
        {
          key: 'ticket_order|Luau',
          title: 'Luau na Duna',
          referenceType: 'ticket_order',
          soldMinor: 1280000,
          sales: 60,
          tickets: 128,
          promoterTickets: 43,
          people: 0,
          groups: 0,
        },
        {
          key: 'booking|Antigo',
          title: 'Aluguel antigo',
          referenceType: 'booking',
          soldMinor: 10000,
          sales: 2,
          tickets: 0,
          promoterTickets: 0,
          people: 0,
          groups: 0,
        },
      ],
      truncated: false,
    }));
  });

  it('abre em 30 dias, troca o período e lista por item', async () => {
    render(<PartnerReportsPage onBack={vi.fn()} profile={<p>visitas</p>} />);
    expect(await screen.findByText('Vendido em 30 dias')).toBeTruthy();
    expect(screen.getByText('Passeio de buggy ao Preá')).toBeTruthy();
    expect(screen.getByText('146 pessoas')).toBeTruthy();
    expect(screen.getByText('128 ingressos · 43 por divulgadores')).toBeTruthy();
    expect(screen.getByText('2 vendas')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '7 dias' }));
    expect(await screen.findByText('Vendido em 7 dias')).toBeTruthy();
    expect(m.reports).toHaveBeenLastCalledWith('7d');
  });

  it('agrupa por semana em 30 dias e por dia em 7 dias; o "^" mostra a escolha', async () => {
    render(<PartnerReportsPage onBack={vi.fn()} profile={null} />);
    expect(await screen.findByRole('button', { name: 'Agrupar por: Semana' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '7 dias' }));
    expect(await screen.findByRole('button', { name: 'Agrupar por: Dia' })).toBeTruthy();
  });

  it('"Visitas e avaliações" abre as métricas do perfil; vindo da página do estabelecimento, abre direto', async () => {
    const onBack = vi.fn();
    render(<PartnerReportsPage onBack={onBack} profile={<p>visitas</p>} initialProfile />);
    expect(screen.getByText('visitas')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Relatórios' }));
    expect(onBack).toHaveBeenCalled();
  });
});
