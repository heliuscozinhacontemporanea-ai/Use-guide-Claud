import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';
import type { PartnerOffer } from '../../types/bookings';
import { PartnerFleetDays } from './PartnerFleetDays';

vi.mock('../../application/usecases/listFleetDaysUseCase', () => ({
  listFleetDaysUseCase: vi.fn(),
}));
vi.mock('../../application/usecases/openFleetDaysUseCase', () => ({
  openFleetDaysUseCase: vi.fn(),
}));

import { listFleetDaysUseCase } from '../../application/usecases/listFleetDaysUseCase';
import { openFleetDaysUseCase } from '../../application/usecases/openFleetDaysUseCase';

const offer = {
  id: 'offer-r',
  kind: 'rental',
  sellingUnit: 'group',
  timeZone: 'America/Fortaleza',
  title: { 'pt-BR': 'Quadriciclo' },
} as unknown as PartnerOffer;

describe('PartnerFleetDays (F3b)', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await i18n.changeLanguage('pt-BR');
  });

  it('mostra veículos e ocupação de cada dia, sem quem reservou', async () => {
    vi.mocked(listFleetDaysUseCase).mockResolvedValue([
      {
        date: '2026-11-21',
        vehicles: 3,
        busy: [
          { startsAt: '2026-11-21T11:00:00.000Z', endsAt: '2026-11-21T15:00:00.000Z', units: 2 },
        ],
      },
      { date: '2026-11-22', vehicles: 0, busy: [] },
    ]);
    render(<PartnerFleetDays offer={offer} />);
    expect(await screen.findByText(/3 veículos/)).toBeTruthy();
    expect(screen.getByText('08:00–12:00 · 2 veículos')).toBeTruthy();
    expect(screen.getByText(/Fechado/)).toBeTruthy();
  });

  it('abrir dias manda datas, dias da semana e veículos, e relê a semana', async () => {
    vi.mocked(listFleetDaysUseCase).mockResolvedValue([]);
    vi.mocked(openFleetDaysUseCase).mockResolvedValue([
      { date: '2026-11-21', vehicles: 2, busy: [] },
    ]);
    render(<PartnerFleetDays offer={offer} />);
    await screen.findByText('Nenhum dia aberto nesta semana.');
    fireEvent.change(screen.getByLabelText('Veículos disponíveis por dia'), {
      target: { value: '2' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Abrir' }));
    await waitFor(() =>
      expect(openFleetDaysUseCase).toHaveBeenCalledWith(
        'offer-r',
        expect.objectContaining({ vehicles: 2, weekdays: [0, 1, 2, 3, 4, 5, 6] })
      )
    );
    expect(await screen.findByText('1 dia aberto.')).toBeTruthy();
    expect(listFleetDaysUseCase).toHaveBeenCalledTimes(2);
  });
});
