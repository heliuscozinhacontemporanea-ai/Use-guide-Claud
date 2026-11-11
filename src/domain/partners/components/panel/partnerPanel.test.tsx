import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';
import type { PartnerHomeView } from '../../types/partnerHome';
import { EstablishmentFilterSheet } from './EstablishmentFilterSheet';
import { EstablishmentTitle } from './EstablishmentTitle';
import { type PartnerCardsState, PartnerHomeTab } from './PartnerHomeTab';
import type { PartnerHomeCardId } from '../../types/partnerHomeCards';
import { type PartnerCardData, partnerCardData } from '../../utils/partnerHomeCardData';
import { PartnerShortcuts } from './PartnerShortcuts';

const VIEW: PartnerHomeView = {
  timeZone: 'America/Fortaleza',
  cards: ['today', 'sales_today', 'reviews'],
  establishments: [
    {
      id: 'buggy',
      name: 'Buggy do Preá',
      category: 'tour',
      location: 'Preá',
      rating: 4.8,
      reviewCount: 96,
      unansweredReviews: 2,
    },
    {
      id: 'pousada',
      name: 'Pousada Vento Leste',
      category: 'lodging',
      location: 'Preá',
      rating: 4,
      reviewCount: 4,
      unansweredReviews: 0,
    },
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
  agora: [],
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
    salesTodayMinor: 234034,
    salesTodayCount: 14,
    nextPayout: {
      releaseAt: '2026-11-10T15:00:00.000Z',
      amountMinor: 518000,
      count: 3,
      accounts: 1,
    },
    month: { currentMinor: 900000, previousMinor: 600000 },
  },
  promoters: null,
  tour: { show: false, tipsOff: false },
  promoCodes: null,
  guestSessions: [],
  upcomingSessions: [],
  week: [],
  plans: [],
  summary: { documents: 1, pendingVerifications: 0 },
};

function cardsState(overrides: Partial<PartnerCardsState> = {}): PartnerCardsState {
  const dataOf = (id: PartnerHomeCardId) => partnerCardData(id, VIEW, VIEW.today, null);
  return {
    dataOf,
    visible: (['today', 'sales_today', 'reviews'] as const).map(
      (id) => partnerCardData(id, VIEW, VIEW.today, null) as PartnerCardData
    ),
    available: ['today', 'sales_today', 'next_payout', 'reviews', 'month_sales'],
    draft: null,
    setDraft: vi.fn(),
    startEditing: vi.fn(),
    cancel: vi.fn(),
    finish: vi.fn(),
    saving: false,
    error: null,
    ...overrides,
  };
}

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

  it('o Início mostra "Resolva agora" e os cartões escolhidos', () => {
    const onOpenTab = vi.fn();
    render(
      <PartnerHomeTab
        loading={false}
        error={null}
        onRetry={vi.fn()}
        view={VIEW}
        attention={VIEW.attention}
        cards={cardsState()}
        labelFor={() => null}
        onOpenAttention={vi.fn()}
        onOpenTab={onOpenTab}
      />
    );
    expect(screen.getByText('Multa ou dívida a pagar')).toBeInTheDocument();
    expect(screen.getByText('Pague até 9 de nov.')).toBeInTheDocument();
    expect(screen.getByText('09:00 · Passeio de buggy')).toBeInTheDocument();
    expect(screen.getByText('4 de 6')).toBeInTheDocument();
    expect(screen.getByText('nos 2 estabelecimentos')).toBeInTheDocument();
    // Média ponderada: (4,8 × 96 + 4 × 4) / 100.
    expect(screen.getByText('4,8 ★')).toBeInTheDocument();
    expect(screen.getByText('2 novas para responder')).toBeInTheDocument();
    // Centavos aparecem quando há centavos.
    expect(screen.getByText(/2\.340,34/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Vendas de hoje/ }));
    expect(onOpenTab).toHaveBeenCalledWith('earnings');
  });

  it('o modo Personalizar tira, reordena pelo teclado e só conclui pelo botão', () => {
    const setDraft = vi.fn();
    const finish = vi.fn();
    render(
      <PartnerHomeTab
        loading={false}
        error={null}
        onRetry={vi.fn()}
        view={VIEW}
        attention={VIEW.attention}
        cards={cardsState({ draft: ['today', 'sales_today'], setDraft, finish })}
        labelFor={() => null}
        onOpenAttention={vi.fn()}
        onOpenTab={vi.fn()}
      />
    );
    expect(screen.queryByText('Multa ou dívida a pagar')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Tirar Hoje' }));
    expect(setDraft).toHaveBeenLastCalledWith(['sales_today']);
    fireEvent.keyDown(screen.getByRole('button', { name: /Mover Vendas de hoje/ }), {
      key: 'ArrowUp',
    });
    expect(setDraft).toHaveBeenLastCalledWith(['sales_today', 'today']);
    expect(screen.queryByText('Cancelar')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar cartão' }));
    expect(screen.getByText('Vendas do mês')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Vendas do mês'));
    expect(setDraft).toHaveBeenLastCalledWith(['today', 'sales_today', 'month_sales']);
    fireEvent.click(screen.getByRole('button', { name: 'Concluir' }));
    expect(finish).toHaveBeenCalled();
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
        cards={cardsState()}
        labelFor={() => null}
        onOpenAttention={vi.fn()}
        onOpenTab={vi.fn()}
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
