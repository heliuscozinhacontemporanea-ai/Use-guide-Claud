import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EventSessionsField } from './EventSessionsField';

const one = [
  { startsAt: '2026-11-01T23:00:00.000Z', endsAt: '2026-11-02T02:00:00.000Z', capacity: 80 },
];

describe('EventSessionsField', () => {
  it('mostra os horários no fuso de Fortaleza e adiciona uma sessão', () => {
    const onChange = vi.fn();
    render(<EventSessionsField sessions={one} onChange={onChange} loadState="ready" />);
    expect(screen.getByLabelText('Início')).toHaveProperty('value', '2026-11-01T20:00');
    fireEvent.click(screen.getByRole('button', { name: /Adicionar data/ }));
    expect(onChange.mock.calls[0]?.[0]).toHaveLength(2);
  });

  it('só permite remover quando há mais de uma sessão', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <EventSessionsField sessions={one} onChange={onChange} loadState="ready" />
    );
    expect(screen.queryByRole('button', { name: /Remover sessão/ })).toBeNull();
    rerender(
      <EventSessionsField sessions={[...one, ...one]} onChange={onChange} loadState="ready" />
    );
    const [firstRemove] = screen.getAllByRole('button', { name: /Remover sessão/ });
    if (firstRemove) fireEvent.click(firstRemove);
    expect(onChange.mock.calls[0]?.[0]).toHaveLength(1);
  });

  it('não deixa editar enquanto as sessões salvas não carregaram', () => {
    render(<EventSessionsField sessions={[]} onChange={vi.fn()} loadState="error" />);
    expect(screen.getByRole('alert').textContent).toMatch(/Não foi possível carregar/);
    expect(screen.queryByRole('button', { name: /Adicionar data/ })).toBeNull();
  });
});
