import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';

const m = vi.hoisted(() => ({ list: vi.fn() }));
vi.mock('../../application/usecases/listSessionEntriesUseCase', () => ({
  listSessionEntriesUseCase: m.list,
}));

import { SessionEntriesSheet } from './SessionEntriesSheet';

describe('Entradas da sessão (A2)', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
    vi.clearAllMocks();
  });

  it('lista quem entrou com lote e horário; convidado e entrada sem internet aparecem', async () => {
    m.list.mockResolvedValue([
      {
        id: 'c2',
        name: null,
        ticketType: 'Cortesia',
        courtesy: true,
        at: '2026-12-21T02:40:00.000Z',
        source: 'offline',
      },
      {
        id: 'c1',
        name: 'Ana Souza',
        ticketType: 'Pista',
        courtesy: false,
        at: '2026-12-21T02:10:00.000Z',
        source: 'online',
      },
    ]);
    render(
      <SessionEntriesSheet
        open
        eventListingId="ev1"
        occurrenceId="s1"
        description="Luau"
        onClose={vi.fn()}
      />
    );
    const sheet = await screen.findByRole('dialog');
    expect(await within(sheet).findByText('2 entradas')).toBeTruthy();
    expect(within(sheet).getByText('Ana Souza')).toBeTruthy();
    expect(within(sheet).getByText('23:10')).toBeTruthy();
    expect(within(sheet).getByText('Convidado')).toBeTruthy();
    expect(within(sheet).getByText('Cortesia · registrada sem internet')).toBeTruthy();
    expect(m.list).toHaveBeenCalledWith('ev1', 's1');
  });

  it('não lê nada enquanto fechada e mostra o vazio', async () => {
    m.list.mockResolvedValue([]);
    const { rerender } = render(
      <SessionEntriesSheet
        open={false}
        eventListingId="ev1"
        occurrenceId="s1"
        description="Luau"
        onClose={vi.fn()}
      />
    );
    expect(m.list).not.toHaveBeenCalled();
    rerender(
      <SessionEntriesSheet
        open
        eventListingId="ev1"
        occurrenceId="s1"
        description="Luau"
        onClose={vi.fn()}
      />
    );
    expect(await screen.findByText('Ninguém entrou ainda.')).toBeTruthy();
  });
});
