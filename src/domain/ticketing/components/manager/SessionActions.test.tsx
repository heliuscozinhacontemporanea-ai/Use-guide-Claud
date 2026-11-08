import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';

const m = vi.hoisted(() => ({ cancel: vi.fn(), postpone: vi.fn() }));
vi.mock('../../../events', () => ({
  cancelPartnerEventOccurrenceUseCase: m.cancel,
  postponePartnerEventOccurrenceUseCase: m.postpone,
}));

import { SessionActions } from './SessionActions';

const OCCURRENCE = {
  id: 'occ-1',
  eventListingId: 'ev-1',
  startsAt: '2099-12-20T22:00:00.000Z',
  endsAt: '2099-12-21T03:00:00.000Z',
  status: 'scheduled' as const,
  capacity: 100,
  createdAt: '',
  updatedAt: '',
};

describe('SessionActions (D14, D16)', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await i18n.changeLanguage('pt-BR');
  });

  it('cancelar com pedidos pagos: multa, força maior, motivo obrigatório e adiar primeiro', async () => {
    const onChanged = vi.fn();
    m.cancel.mockResolvedValue(undefined);
    render(
      <SessionActions
        eventListingId="ev-1"
        occurrence={OCCURRENCE}
        paidOrders={4}
        onChanged={onChanged}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar sessão' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(/4 pedidos pagos/)).toBeTruthy();
    expect(within(dialog).getByText(/multa de 20% do valor vendido/)).toBeTruthy();
    expect(within(dialog).getByRole('button', { name: 'Adiar em vez de cancelar' })).toBeTruthy();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancelar sessão' }));
    expect(await within(dialog).findByText('Informe o motivo do cancelamento.')).toBeTruthy();
    expect(m.cancel).not.toHaveBeenCalled();
    fireEvent.change(within(dialog).getByLabelText('Motivo do cancelamento'), {
      target: { value: 'Interdição da praia' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancelar sessão' }));
    await waitFor(() =>
      expect(m.cancel).toHaveBeenCalledWith('ev-1', 'occ-1', 'Interdição da praia')
    );
    expect(onChanged).toHaveBeenCalledWith('Sessão cancelada. Os reembolsos foram iniciados.');
  });

  it('adiar mantém a duração e converte a hora de Fortaleza', async () => {
    m.postpone.mockResolvedValue(undefined);
    render(
      <SessionActions
        eventListingId="ev-1"
        occurrence={OCCURRENCE}
        paidOrders={1}
        onChanged={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Adiar sessão' }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText('Nova data e hora de início'), {
      target: { value: '2099-12-27T19:00' },
    });
    fireEvent.change(within(dialog).getByLabelText('Motivo'), { target: { value: 'Chuva forte' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Adiar sessão' }));
    await waitFor(() =>
      expect(m.postpone).toHaveBeenCalledWith('ev-1', 'occ-1', {
        startsAt: '2099-12-27T22:00:00.000Z',
        endsAt: '2099-12-28T03:00:00.000Z',
        reason: 'Chuva forte',
      })
    );
  });

  it('sessão adiada não mostra as ações, só o status', () => {
    render(
      <SessionActions
        eventListingId="ev-1"
        occurrence={{ ...OCCURRENCE, status: 'postponed' }}
        paidOrders={0}
        onChanged={vi.fn()}
      />
    );
    expect(screen.getByText('Sessão adiada')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Cancelar sessão' })).toBeNull();
  });
});
