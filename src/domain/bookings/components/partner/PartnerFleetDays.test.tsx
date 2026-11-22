import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';
import type { PartnerOffer } from '../../types/bookings';
import { PartnerFleetDays } from './PartnerFleetDays';
import { PartnerOfferPage } from './PartnerOfferPage';

vi.mock('../../application/usecases/listFleetDaysUseCase', () => ({
  listFleetDaysUseCase: vi.fn(),
}));
vi.mock('../../application/usecases/openFleetDaysUseCase', () => ({
  openFleetDaysUseCase: vi.fn(),
}));
vi.mock('../../application/usecases/listPartnerOffersUseCase', () => ({
  listPartnerOffersUseCase: vi.fn(),
}));

import { listFleetDaysUseCase } from '../../application/usecases/listFleetDaysUseCase';
import { listPartnerOffersUseCase } from '../../application/usecases/listPartnerOffersUseCase';
import { openFleetDaysUseCase } from '../../application/usecases/openFleetDaysUseCase';

const offer = {
  id: 'offer-r',
  kind: 'rental',
  sellingUnit: 'group',
  timeZone: 'America/Fortaleza',
  title: { 'pt-BR': 'Quadriciclo' },
  fleet: {
    fixed: [{ id: 'p1', start: '08:00', minutes: 240 }],
    custom: { mode: 'hours', minHours: 2 },
  },
} as unknown as PartnerOffer;

describe('PartnerFleetDays (F3b)', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await i18n.changeLanguage('pt-BR');
  });

  it('mostra veículos, ocupação de cada dia com a origem e a barra, sem quem reservou', async () => {
    vi.mocked(listFleetDaysUseCase).mockResolvedValue([
      {
        date: '2026-11-21',
        vehicles: 3,
        opensAt: '2026-11-21T11:00:00.000Z',
        closesAt: '2026-11-21T21:00:00.000Z',
        busy: [
          { startsAt: '2026-11-21T11:00:00.000Z', endsAt: '2026-11-21T15:00:00.000Z', units: 2 },
          { startsAt: '2026-11-21T17:00:00.000Z', endsAt: '2026-11-21T20:00:00.000Z', units: 1 },
        ],
      },
      { date: '2026-11-22', vehicles: 0, busy: [] },
    ]);
    const onOpenForm = vi.fn();
    render(<PartnerFleetDays offer={offer} onOpenForm={onOpenForm} />);
    expect(await screen.findByText(/3 veículos/)).toBeTruthy();
    expect(screen.getByText('08:00–12:00 · 2 veículos (período)')).toBeTruthy();
    expect(screen.getByText('14:00–17:00 · 1 veículo (personalizado)')).toBeTruthy();
    expect(screen.getByText(/Fechado/)).toBeTruthy();
    // "Abrir dias" abre a página do formulário com os veículos do último dia aberto.
    fireEvent.click(screen.getByRole('button', { name: 'Abrir dias' }));
    expect(onOpenForm).toHaveBeenCalledWith(3);
  });

  it('página "Abrir dias": datas de hoje ao fim do mês seguinte, "Abrir" na barra e aviso ao terminar', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-21T15:00:00.000Z'));
    vi.mocked(listPartnerOffersUseCase).mockResolvedValue([offer]);
    vi.mocked(openFleetDaysUseCase).mockResolvedValue([
      { date: '2026-11-21', vehicles: 2, busy: [] },
    ]);
    let save: (() => void) | null = null;
    const onFormDone = vi.fn();
    render(
      <PartnerOfferPage
        page={{ kind: 'openDays', offerId: 'offer-r', vehicles: 3 }}
        registerSave={(next) => {
          save = next;
        }}
        onSaved={vi.fn()}
        onOpenPage={vi.fn()}
        onFormDone={onFormDone}
        version={0}
      />
    );
    const vehicles = await screen.findByLabelText('Veículos disponíveis por dia');
    expect((vehicles as HTMLInputElement).value).toBe('3');
    fireEvent.change(vehicles, { target: { value: '2' } });
    (save as unknown as () => void)();
    await waitFor(() =>
      expect(openFleetDaysUseCase).toHaveBeenCalledWith('offer-r', {
        startDate: '2026-11-21',
        endDate: '2026-12-31',
        weekdays: [0, 1, 2, 3, 4, 5, 6],
        vehicles: 2,
      })
    );
    await waitFor(() => expect(onFormDone).toHaveBeenCalledWith('1 dia aberto.'));
    vi.useRealTimers();
  });
});
