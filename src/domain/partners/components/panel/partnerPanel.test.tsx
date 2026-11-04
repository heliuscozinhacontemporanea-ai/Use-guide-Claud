import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';
import type { PartnerHomeView } from '../../types/partnerHome';
import { EstablishmentFilterSheet } from './EstablishmentFilterSheet';
import { EstablishmentTitle } from './EstablishmentTitle';
import { PartnerHomeTab } from './PartnerHomeTab';
import { PartnerShortcuts } from './PartnerShortcuts';

const VIEW: PartnerHomeView = {
  establishments: [
    { id: 'buggy', name: 'Buggy do Preá', category: 'tour' },
    { id: 'pousada', name: 'Pousada Vento Leste', category: 'lodging' },
  ],
  attention: [
    {
      kind: 'debt',
      refId: 'd1',
      establishmentIds: ['buggy'],
      title: 'Buggy do Preá',
      deadline: '2026-11-09T13:00:00.000Z',
      amountMinor: 5000,
    },
  ],
  today: [
    {
      kind: 'slot',
      id: 's1',
      parentId: 'o1',
      establishmentIds: ['buggy'],
      title: 'Passeio de buggy',
      startsAt: '2026-11-08T12:00:00.000Z',
      endsAt: null,
      sold: 6,
      capacity: 8,
      checkedIn: 4,
      arrivedAt: null,
    },
  ],
  numbers: {
    salesTodayMinor: 234000,
    salesTodayCount: 14,
    nextPayout: { releaseAt: '2026-11-10T15:00:00.000Z', amountMinor: 518000, count: 3 },
  },
};

describe('casca do painel do parceiro (D27)', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
  });

  it('mostra os cinco atalhos e marca a aba atual', () => {
    const onChange = vi.fn();
    render(<PartnerShortcuts value="home" onChange={onChange} />);
    const tabs = screen.getAllByRole('button');
    expect(tabs.map((tab) => tab.textContent)).toEqual([
      'Início',
      'Agenda',
      'Catálogo',
      'Ganhos',
      'Mais',
    ]);
    expect(tabs[0]).toHaveAttribute('aria-current', 'page');
    fireEvent.click(screen.getByRole('button', { name: 'Ganhos' }));
    expect(onChange).toHaveBeenCalledWith('earnings');
  });

  it('com um estabelecimento só, o nome não abre o filtro', () => {
    render(
      <EstablishmentTitle
        name="Buggy do Preá"
        canChoose={false}
        otherPending={false}
        onOpen={vi.fn()}
      />
    );
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByRole('heading', { name: 'Buggy do Preá' })).toBeInTheDocument();
  });

  it('o Início mostra "Resolva agora", "Hoje" com a etiqueta do lugar e os números', () => {
    render(
      <PartnerHomeTab
        loading={false}
        error={null}
        onRetry={vi.fn()}
        view={VIEW}
        attention={VIEW.attention}
        today={VIEW.today}
        labelFor={() => 'Buggy'}
        onOpenAttention={vi.fn()}
        onOpenToday={vi.fn()}
      />
    );
    expect(screen.getByText('Multa ou dívida a pagar')).toBeInTheDocument();
    expect(screen.getByText('Pague até 9 de nov.')).toBeInTheDocument();
    expect(screen.getByText('09:00 · Passeio de buggy')).toBeInTheDocument();
    expect(screen.getByText('6 de 8 · 4 com código')).toBeInTheDocument();
    expect(screen.getByText('Buggy')).toBeInTheDocument();
    expect(screen.getByText(/14 vendas de todos os estabelecimentos/)).toBeInTheDocument();
  });

  it('o erro sem dados oferece nova tentativa', () => {
    const onRetry = vi.fn();
    render(
      <PartnerHomeTab
        loading={false}
        error="PARTNER_HOME_UNAVAILABLE"
        onRetry={onRetry}
        view={null}
        attention={[]}
        today={[]}
        labelFor={() => null}
        onOpenAttention={vi.fn()}
        onOpenToday={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onRetry).toHaveBeenCalled();
  });

  it('a folha escolhe um estabelecimento ou todos, e mostra as pendências', () => {
    const onChange = vi.fn();
    render(
      <EstablishmentFilterSheet
        open
        onOpenChange={vi.fn()}
        establishments={VIEW.establishments}
        pendingById={{ buggy: 1 }}
        value={null}
        onChange={onChange}
        onCreate={vi.fn()}
      />
    );
    expect(screen.getByRole('button', { name: /Todos os estabelecimentos/ })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByText('1 pendência')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Pousada Vento Leste/ }));
    expect(onChange).toHaveBeenCalledWith('pousada');
  });
});
