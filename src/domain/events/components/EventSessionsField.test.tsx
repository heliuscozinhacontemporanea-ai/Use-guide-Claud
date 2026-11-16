import { fireEvent, render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../shared/i18n';
import type { EventSessionDraft } from '../types/eventSession';
import { EventSessionsField } from './EventSessionsField';

const one = [
  { startsAt: '2026-11-01T23:00:00.000Z', endsAt: '2026-11-02T02:00:00.000Z', capacity: 80 },
];

describe('EventSessionsField', () => {
  beforeAll(async () => {
    await i18n.changeLanguage('pt-BR');
  });
  it('sem fuso do lugar, usa o da plataforma e adiciona uma sessão', () => {
    const onChange = vi.fn();
    render(<EventSessionsField sessions={one} onChange={onChange} loadState="ready" />);
    expect(screen.getByLabelText('Início')).toHaveProperty('value', '2026-11-01T20:00');
    fireEvent.click(screen.getByRole('button', { name: /Adicionar data/ }));
    expect(onChange.mock.calls[0]?.[0]).toHaveLength(2);
  });

  it('lê e grava as sessões na hora do lugar do estabelecimento', () => {
    const onChange = vi.fn();
    render(
      <EventSessionsField
        sessions={one}
        onChange={onChange}
        loadState="ready"
        place={{ timeZone: 'Pacific/Kiritimati', city: 'Manaus' }}
      />
    );
    // 23:00Z é 13:00 do dia seguinte em UTC+14.
    const start = screen.getByLabelText('Início');
    expect(start).toHaveProperty('value', '2026-11-02T13:00');
    expect(screen.getByText('Horários de Manaus (UTC+14).')).toBeTruthy();
    fireEvent.change(start, { target: { value: '2026-11-02T14:00' } });
    expect(onChange.mock.calls[0]?.[0]?.[0]?.startsAt).toBe('2026-11-02T00:00:00.000Z');
  });

  it('só permite remover quando há mais de uma sessão', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <EventSessionsField sessions={one} onChange={onChange} loadState="ready" />
    );
    expect(screen.queryByRole('button', { name: /Remover Sessão/ })).toBeNull();
    rerender(
      <EventSessionsField sessions={[...one, ...one]} onChange={onChange} loadState="ready" />
    );
    const [firstRemove] = screen.getAllByRole('button', { name: /Remover Sessão/ });
    if (firstRemove) fireEvent.click(firstRemove);
    expect(onChange.mock.calls[0]?.[0]).toHaveLength(1);
  });

  it('sessão com vendas ou cortesias fica sem lixeira e diz onde cancelar (D27)', () => {
    const onChange = vi.fn();
    const sessions: EventSessionDraft[] = [
      { ...one[0], id: 'vendida' } as EventSessionDraft,
      { ...one[0], id: 'livre' } as EventSessionDraft,
    ];
    render(
      <EventSessionsField
        sessions={sessions}
        onChange={onChange}
        loadState="ready"
        lockedIds={['vendida']}
      />
    );
    expect(screen.queryByRole('button', { name: 'Remover Sessão 1' })).toBeNull();
    expect(screen.getByText(/cancele ou adie pela folha da sessão/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Remover Sessão 2' }));
    expect(onChange.mock.calls[0]?.[0]).toEqual([sessions[0]]);
  });

  it('não deixa editar enquanto as sessões salvas não carregaram', () => {
    render(<EventSessionsField sessions={[]} onChange={vi.fn()} loadState="error" />);
    expect(screen.getByRole('alert').textContent).toMatch(/Não foi possível carregar/);
    expect(screen.queryByRole('button', { name: /Adicionar data/ })).toBeNull();
  });
});
