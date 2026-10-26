import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';
import type { PartnerSlot } from '../../types/bookings';
import { SlotCancelDialog } from './SlotCancelDialog';
import { SlotRescheduleDialog } from './SlotRescheduleDialog';

const SLOT: PartnerSlot = {
  id: 'slot-1',
  startsAt: '2099-11-10T11:00:00.000Z',
  endsAt: null,
  capacityTotal: 8,
  capacityReserved: 0,
  capacitySold: 3,
  status: 'open',
};

describe('cancelar e remarcar horário (D14, D16)', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
  });

  it('com vagas vendidas: mostra a multa, a força maior e oferece remarcar', () => {
    const onReschedule = vi.fn();
    const onConfirm = vi.fn();
    render(
      <SlotCancelDialog
        slot={SLOT}
        onClose={vi.fn()}
        onConfirm={onConfirm}
        onReschedule={onReschedule}
      />
    );
    expect(screen.getByText(/3 vagas vendidas/)).toBeTruthy();
    expect(screen.getByText(/multa de 20% do valor vendido/)).toBeTruthy();
    expect(screen.getByText(/força maior/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Remarcar em vez de cancelar' }));
    expect(onReschedule).toHaveBeenCalledWith(SLOT);
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar horário' }));
    expect(onConfirm).toHaveBeenCalledWith(SLOT);
  });

  it('sem vendas: sem multa e sem sugestão de remarcar', () => {
    render(
      <SlotCancelDialog
        slot={{ ...SLOT, capacitySold: 0 }}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        onReschedule={vi.fn()}
      />
    );
    expect(screen.queryByText(/multa/)).toBeNull();
    expect(screen.queryByRole('button', { name: 'Remarcar em vez de cancelar' })).toBeNull();
  });

  it('remarcar: hora de Fortaleza vira UTC; data passada ou sem motivo é recusada', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<SlotRescheduleDialog slot={SLOT} onClose={vi.fn()} onSubmit={onSubmit} />);
    const when = screen.getByLabelText('Nova data e hora');
    fireEvent.change(when, { target: { value: '2020-01-01T10:00' } });
    fireEvent.change(screen.getByLabelText('Motivo'), { target: { value: 'Mar agitado' } });
    fireEvent.click(screen.getByRole('button', { name: 'Remarcar horário' }));
    expect(await screen.findByText('Informe uma data futura e o motivo.')).toBeTruthy();
    fireEvent.change(when, { target: { value: '2099-11-12T09:30' } });
    fireEvent.click(screen.getByRole('button', { name: 'Remarcar horário' }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(SLOT, {
        startsAt: '2099-11-12T12:30:00.000Z',
        reason: 'Mar agitado',
      })
    );
  });
});
