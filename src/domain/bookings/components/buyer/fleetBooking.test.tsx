import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';
import type { PublicFleetDay, PublicOffer } from '../../types/bookings';
import {
  customStarts,
  freeVehicles,
  maxHoursFrom,
  nextPlaceDates,
} from '../../utils/fleetAvailability';
import { fleetQuote, fleetRequest } from '../../utils/fleetSelection';
import { BookingOfferPanel } from './BookingOfferPanel';

vi.mock('../../application/usecases/getPublicFleetDayUseCase', () => ({
  getPublicFleetDayUseCase: vi.fn(),
}));
vi.mock('../../application/usecases/createBookingUseCase', () => ({
  createBookingUseCase: vi.fn(),
}));
vi.mock('../../application/usecases/getBookingUseCase', () => ({ getBookingUseCase: vi.fn() }));
vi.mock('../../application/usecases/listPublishedOffersForItemUseCase', () => ({
  listPublishedOffersForItemUseCase: vi.fn(),
}));

import { createBookingUseCase } from '../../application/usecases/createBookingUseCase';
import { getPublicFleetDayUseCase } from '../../application/usecases/getPublicFleetDayUseCase';
import { listPublishedOffersForItemUseCase } from '../../application/usecases/listPublishedOffersForItemUseCase';

// Jericoacoara fica em UTC−3: 08:00 no lugar é 11:00Z.
const at = (hhmm: string) => `2026-11-21T${hhmm}:00.000Z`;

const rental = {
  id: 'quad',
  guideItemId: 'item-1',
  kind: 'rental',
  status: 'published',
  title: { 'pt-BR': 'Quadriciclo' },
  pricing: {
    currency: 'BRL',
    priceOptions: [
      { id: 'p1', label: { 'pt-BR': '4 h' }, unitAmountMinor: 30000 },
      { id: 'hourly', label: { 'pt-BR': '1 h' }, unitAmountMinor: 8000 },
    ],
  },
  cancellationPolicy: 'flexible',
  maxParticipantsPerBooking: 3,
  requiresParticipantNames: false,
  sellingUnit: 'group',
  groupMaxPeople: 2,
  vehicle: 'Quadriciclo',
  requiresDriverLicense: true,
  pickupMode: 'meeting_point',
  fleet: {
    fixed: [{ id: 'p1', start: '08:00', minutes: 240 }],
    custom: { mode: 'hours', minHours: 2 },
  },
  timeZone: 'America/Fortaleza',
  city: 'Jericoacoara',
  updatedAt: '',
} as PublicOffer & { kind: 'rental' };

const rentalDay: PublicFleetDay = {
  date: '2026-11-21',
  vehicles: 3,
  opensAt: at('11:00'),
  closesAt: at('21:00'),
  busy: [{ startsAt: at('11:00'), endsAt: at('15:00'), units: 2 }],
  fixed: [{ id: 'p1', startsAt: at('11:00'), endsAt: at('15:00'), available: 1 }],
  custom: { mode: 'hours', minHours: 2, earliestStartsAt: at('09:00') },
};

const transfer = {
  ...rental,
  id: 'jeri-aero',
  kind: 'transfer',
  vehicle: undefined,
  requiresDriverLicense: undefined,
  pickupMode: 'buyer_address',
  groupMaxPeople: 4,
  route: { from: 'Jericoacoara', to: 'Aeroporto de Jeri' },
  durationMinutes: 60,
  pricing: {
    currency: 'BRL',
    priceOptions: [{ id: 'vehicle', label: { 'pt-BR': 'Veículo' }, unitAmountMinor: 25000 }],
  },
  fleet: { fixed: [], custom: { mode: 'time', from: '06:00', to: '22:00', minNoticeHours: 12 } },
} as PublicOffer & { kind: 'transfer' };

const transferDay: PublicFleetDay = {
  date: '2026-11-21',
  vehicles: 2,
  busy: [{ startsAt: at('10:00'), endsAt: at('12:00'), units: 2 }],
  fixed: [],
  custom: {
    mode: 'time',
    from: '06:00',
    to: '22:00',
    minNoticeHours: 12,
    earliestStartsAt: at('08:00'),
  },
};

const placeIso = (date: string, hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number) as [number, number];
  return new Date(Date.parse(`${date}T00:00:00.000Z`) + ((h + 3) * 60 + m) * 60_000).toISOString();
};

describe('disponibilidade por veículo (F3b)', () => {
  it('veículos livres contam o pico dentro do intervalo', () => {
    const busy = [
      { startsAt: at('11:00'), endsAt: at('15:00'), units: 2 },
      { startsAt: at('13:00'), endsAt: at('17:00'), units: 1 },
    ];
    expect(freeVehicles(3, busy, Date.parse(at('11:00')), Date.parse(at('13:00')))).toBe(1);
    expect(freeVehicles(3, busy, Date.parse(at('11:00')), Date.parse(at('14:00')))).toBe(0);
    expect(freeVehicles(3, busy, Date.parse(at('17:00')), Date.parse(at('19:00')))).toBe(3);
  });

  it('aluguel: inícios de 30 em 30 min no horário do anúncio, com o mínimo de horas até fechar', () => {
    const starts = customStarts(rental, rentalDay, Date.parse(at('09:00')), placeIso);
    expect(starts[0]?.startsAt).toBe(at('11:00'));
    expect(starts.at(-1)?.startsAt).toBe(at('19:00'));
    expect(starts).toHaveLength(17);
    // Depois de agora: o que já passou some.
    expect(customStarts(rental, rentalDay, Date.parse(at('12:10')), placeIso)[0]?.startsAt).toBe(
      at('12:30')
    );
  });

  it('aluguel: as horas param no fechamento ou quando acaba o veículo livre', () => {
    expect(maxHoursFrom(rentalDay, at('11:00'), 2)).toBe(10);
    const tight = {
      ...rentalDay,
      busy: [...rentalDay.busy, { startsAt: at('13:00'), endsAt: at('17:00'), units: 1 }],
    };
    expect(maxHoursFrom(tight, at('11:00'), 2)).toBe(2);
  });

  it('translado: a hora escolhida ocupa ida e volta', () => {
    const starts = customStarts(transfer, transferDay, Date.parse(at('08:00')), placeIso);
    expect(starts[0]).toEqual({ startsAt: at('09:00'), free: 0 });
    expect(starts.find((start) => start.startsAt === at('12:00'))?.free).toBe(2);
    const quote = fleetQuote(transfer, transferDay, { mode: 'custom', startsAt: at('12:00') });
    expect(quote).toMatchObject({
      priceOptionId: 'vehicle',
      unitAmountMinor: 25000,
      endsAt: at('13:00'),
      free: 2,
    });
  });

  it('preço: período pelo id, hora vezes as horas; pedido leva só dia e escolha', () => {
    expect(fleetQuote(rental, rentalDay, { mode: 'fixed', periodId: 'p1' })).toMatchObject({
      priceOptionId: 'p1',
      unitAmountMinor: 30000,
      free: 1,
    });
    const custom = { mode: 'custom' as const, startsAt: at('11:00'), hours: 3 };
    expect(fleetQuote(rental, rentalDay, custom)).toMatchObject({
      priceOptionId: 'hourly',
      unitAmountMinor: 24000,
      endsAt: at('14:00'),
      free: 1,
    });
    expect(fleetRequest('2026-11-21', { mode: 'fixed', periodId: 'p1' }, rentalDay)).toEqual({
      date: '2026-11-21',
      periodId: 'p1',
    });
    expect(fleetRequest('2026-11-21', custom, rentalDay)).toEqual({
      date: '2026-11-21',
      startsAt: at('11:00'),
      hours: 3,
    });
    expect(
      fleetRequest('2026-11-21', { mode: 'custom', startsAt: at('12:00') }, transferDay)
    ).toEqual({ date: '2026-11-21', startsAt: at('12:00') });
  });

  it('dias seguem o calendário na virada do mês', () => {
    expect(nextPlaceDates('2026-11-30', 3)).toEqual(['2026-11-30', '2026-12-01', '2026-12-02']);
  });
});

describe('reserva de aluguel por horas (F3b, protótipo tela 5)', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(at('09:00')));
    await i18n.changeLanguage('pt-BR');
    vi.mocked(listPublishedOffersForItemUseCase).mockResolvedValue([rental]);
    vi.mocked(getPublicFleetDayUseCase).mockResolvedValue(rentalDay);
    vi.mocked(createBookingUseCase).mockResolvedValue({
      bookingId: 'b1',
      status: 'pending_payment',
      clientSecret: 'cs_test',
      totalMinor: 24000,
      expiresAt: null,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function renderPanel() {
    render(
      <BookingOfferPanel
        guideItemId="item-1"
        isAuthenticated
        onRequireLogin={vi.fn()}
        onViewMyBookings={vi.fn()}
        renderPaymentElement={() => null}
      />
    );
  }

  it('mostra os preços da oferta e o dia de hoje na hora do lugar', async () => {
    renderPanel();
    expect(await screen.findByText(/08:00 · 4 h — R\$\s300,00 por veículo/)).toBeTruthy();
    expect(screen.getByText(/Por hora, mínimo 2 h — R\$\s80,00/)).toBeTruthy();
    expect(screen.getByText('até 2 pessoas · retirada na loja · exige CNH')).toBeTruthy();
    await waitFor(() =>
      expect(getPublicFleetDayUseCase).toHaveBeenCalledWith('quad', '2026-11-21')
    );
    expect(await screen.findByText('1 livre')).toBeTruthy();
  });

  it('personalizar: horas, veículos, CNH e telefone vão no pedido; o preço é só exibição', async () => {
    renderPanel();
    fireEvent.click(await screen.findByRole('button', { name: 'Personalizar' }));
    fireEvent.click(await screen.findByRole('button', { name: '08:00' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mais uma hora' }));
    expect(screen.getByText('mínimo 2 h · devolução 11:00')).toBeTruthy();
    expect(screen.getByText(/R\$\s240,00/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Reservar' }));

    expect(screen.getByText('até 2 pessoas cada · 1 livre')).toBeTruthy();
    // Total em duas colunas, como no protótipo (tela 5).
    expect(screen.getByText('Total').parentElement?.textContent).toMatch(/^Total\s*R\$\s240,00$/);
    expect(
      (screen.getByRole('button', { name: 'Mais um veículo' }) as HTMLButtonElement).disabled
    ).toBe(true);
    const proceed = screen.getByRole('button', {
      name: 'Ir para o pagamento',
    }) as HTMLButtonElement;
    fireEvent.click(screen.getByLabelText(/Quem vai dirigir tem CNH válida/));
    fireEvent.change(screen.getByPlaceholderText('(85) 99999-9999'), {
      target: { value: '88999990000' },
    });
    expect(proceed.disabled).toBe(true);
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[checkboxes.length - 1] as HTMLElement);
    expect(proceed.disabled).toBe(false);
    fireEvent.click(proceed);

    await waitFor(() => expect(createBookingUseCase).toHaveBeenCalled());
    expect(vi.mocked(createBookingUseCase).mock.calls[0]?.[0]).toMatchObject({
      offerId: 'quad',
      fleet: { date: '2026-11-21', startsAt: at('11:00'), hours: 3 },
      lines: [{ priceOptionId: 'hourly', quantity: 1 }],
      participants: [],
      driverLicenseDeclared: true,
      contactPhone: '+5588999990000',
    });
  });

  it('abre no primeiro dia que ainda tem horário (resposta 17, 2026-11-22)', async () => {
    const closedToday = {
      ...rentalDay,
      fixed: rentalDay.fixed.map((p) => ({ ...p, available: 0 })),
      custom: undefined,
    };
    vi.mocked(getPublicFleetDayUseCase).mockImplementation(async (_offerId, date) =>
      date === '2026-11-21' ? closedToday : { ...rentalDay, date }
    );
    renderPanel();
    await waitFor(() =>
      expect(getPublicFleetDayUseCase).toHaveBeenCalledWith('quad', '2026-11-22')
    );
    const day22 = await screen.findByRole('button', { name: /22 de novembro/ });
    await waitFor(() => expect(day22.getAttribute('aria-pressed')).toBe('true'));
  });

  it('sem a CNH marcada a reserva não segue', async () => {
    renderPanel();
    fireEvent.click(await screen.findByRole('button', { name: /08:00\s–\s12:00|08:00–12:00/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Reservar' }));
    fireEvent.change(screen.getByPlaceholderText('(85) 99999-9999'), {
      target: { value: '88999990000' },
    });
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[checkboxes.length - 1] as HTMLElement);
    expect(
      (screen.getByRole('button', { name: 'Ir para o pagamento' }) as HTMLButtonElement).disabled
    ).toBe(true);
  });
});

describe('reserva de translado na hora (F3b, protótipo tela 6)', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(at('08:00')));
    await i18n.changeLanguage('pt-BR');
    vi.mocked(listPublishedOffersForItemUseCase).mockResolvedValue([transfer]);
    vi.mocked(getPublicFleetDayUseCase).mockResolvedValue(transferDay);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('explica os horários riscados, mostra a chegada e pede o endereço de busca', async () => {
    render(
      <BookingOfferPanel
        guideItemId="item-2"
        isAuthenticated
        onRequireLogin={vi.fn()}
        onViewMyBookings={vi.fn()}
        renderPaymentElement={() => null}
      />
    );
    // Horários agrupados por parte do dia (resposta 4, 2026-11-21).
    const morning = await screen.findByRole('group', { name: 'Manhã' });
    const crossed = within(morning).getByRole('button', { name: '06:00 · Esgotado' });
    expect((crossed as HTMLButtonElement).disabled).toBe(true);
    expect(
      within(screen.getByRole('group', { name: 'Tarde' })).getByRole('button', { name: '12:00' })
    ).toBeTruthy();
    expect(
      within(screen.getByRole('group', { name: 'Noite' })).getByRole('button', { name: '22:00' })
    ).toBeTruthy();
    expect(
      screen.getByText('Horários riscados: sem veículo livre (cada viagem ocupa ida e volta).')
    ).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '09:00' }));
    expect(screen.getByText(/Chegada prevista 10:00\./)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Reservar' }));
    expect(screen.getByLabelText('Endereço de busca')).toBeTruthy();
    expect(screen.getByText('até 4 passageiros cada · 2 livres')).toBeTruthy();
  });
});
