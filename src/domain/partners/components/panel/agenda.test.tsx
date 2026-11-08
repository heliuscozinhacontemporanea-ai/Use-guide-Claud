import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';
import type { PartnerTodayItem } from '../../types/partnerHome';

const m = vi.hoisted(() => ({ agenda: vi.fn() }));
vi.mock('../../application/usecases/getPartnerAgendaUseCase', () => ({
  getPartnerAgendaUseCase: m.agenda,
}));

import { AgendaDayList } from './AgendaDayList';
import { PartnerAgendaTab } from './PartnerAgendaTab';

function item(overrides: Partial<PartnerTodayItem>): PartnerTodayItem {
  return {
    kind: 'slot',
    id: 's1',
    parentId: 'o1',
    establishmentIds: ['buggy'],
    title: 'Passeio de buggy',
    startsAt: '2026-11-04T12:00:00.000Z',
    endsAt: null,
    sold: 6,
    capacity: 8,
    checkedIn: 4,
    arrivedAt: null,
    ...overrides,
  };
}

describe('Agenda (p05)', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
    vi.clearAllMocks();
  });

  it('lista do dia: pessoas e chegadas, vagas livres, evento com portaria hoje', () => {
    const onOpen = vi.fn();
    render(
      <AgendaDayList
        title="terça-feira, 4 de novembro"
        isToday
        labelFor={() => null}
        onOpen={onOpen}
        items={[
          item({}),
          item({ id: 's2', title: 'Kitesurf', sold: 2, capacity: 4, checkedIn: 0 }),
          item({
            id: 'e1',
            kind: 'session',
            title: 'Luau',
            sold: 128,
            capacity: 300,
            checkedIn: null,
          }),
        ]}
      />
    );
    expect(screen.getByText('6 pessoas · 4 chegaram')).toBeInTheDocument();
    expect(screen.getByText('2 pessoas · 2 vagas livres')).toBeInTheDocument();
    expect(screen.getByText('Evento · 128 de 300')).toBeInTheDocument();
    expect(screen.getByText('Portaria')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Luau/ }));
    expect(onOpen).toHaveBeenCalledWith(expect.objectContaining({ id: 'e1' }));
  });

  it('carrega a semana de segunda a domingo e troca de semana pelas setas', async () => {
    m.agenda.mockResolvedValue([]);
    render(
      <PartnerAgendaTab
        visible={() => true}
        labelFor={() => null}
        onOpenItem={vi.fn()}
        reloadKey={0}
      />
    );
    await waitFor(() => expect(m.agenda).toHaveBeenCalledTimes(1));
    const [from, to] = m.agenda.mock.calls[0] as [string, string];
    expect(new Date(to).getTime() - new Date(from).getTime()).toBe(7 * 24 * 60 * 60_000);
    fireEvent.click(screen.getByRole('button', { name: 'Próxima semana' }));
    await waitFor(() => expect(m.agenda).toHaveBeenCalledTimes(2));
    const [nextFrom] = m.agenda.mock.calls[1] as [string];
    expect(new Date(nextFrom).getTime() - new Date(from).getTime()).toBe(7 * 24 * 60 * 60_000);
    expect(screen.getAllByRole('button', { pressed: true })).toHaveLength(1);
  });
});
