import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';
import { useBookingCheckout } from '../../hooks/useBookingCheckout';
import type { PublicOffer } from '../../types/bookings';
import { previewRefund } from '../../utils/refundPreview';
import { BookingOfferPanel } from './BookingOfferPanel';
import { QuantitySelector } from './QuantitySelector';
import { SlotPicker } from './SlotPicker';

vi.mock('../../application/usecases/listAvailableSlotsUseCase', () => ({
  listAvailableSlotsUseCase: vi.fn(),
}));
vi.mock('../../application/usecases/createBookingUseCase', () => ({
  createBookingUseCase: vi.fn(),
}));
vi.mock('../../application/usecases/getBookingUseCase', () => ({ getBookingUseCase: vi.fn() }));
vi.mock('../../application/usecases/listPublishedOffersForItemUseCase', () => ({
  listPublishedOffersForItemUseCase: vi.fn(),
}));

import { createBookingUseCase } from '../../application/usecases/createBookingUseCase';
import { listAvailableSlotsUseCase } from '../../application/usecases/listAvailableSlotsUseCase';
import { listPublishedOffersForItemUseCase } from '../../application/usecases/listPublishedOffersForItemUseCase';

const OPTIONS = [
  { id: 'adult', label: { 'pt-BR': 'Adulto' }, unitAmountMinor: 10000 },
  { id: 'child', label: { 'pt-BR': 'Criança' }, unitAmountMinor: 5000, maxQuantity: 1 },
];

describe('componentes de compra', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await i18n.changeLanguage('pt-BR');
  });

  it('SlotPicker desabilita horários esgotados', async () => {
    vi.mocked(listAvailableSlotsUseCase).mockResolvedValue([
      { id: 's1', startsAt: '2026-11-10T11:00:00.000Z', available: 0 },
      { id: 's2', startsAt: '2026-11-10T17:00:00.000Z', available: 3 },
    ]);
    render(<SlotPicker offerId="offer-1" selectedId={null} onSelect={vi.fn()} />);
    const soldOut = await screen.findByRole('button', { name: /Esgotado/ });
    expect((soldOut as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole('button', { name: /3 vagas/ }) as HTMLButtonElement).disabled).toBe(
      false
    );
  });

  it('QuantitySelector respeita o limite total e o máximo da opção', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <QuantitySelector
        options={OPTIONS}
        maxParticipants={2}
        value={{ adult: 2 }}
        onChange={onChange}
      />
    );
    expect(
      (screen.getByRole('button', { name: 'Adicionar Adulto' }) as HTMLButtonElement).disabled
    ).toBe(true);
    expect(
      (screen.getByRole('button', { name: 'Adicionar Criança' }) as HTMLButtonElement).disabled
    ).toBe(true);
    rerender(
      <QuantitySelector
        options={OPTIONS}
        maxParticipants={4}
        value={{ child: 1 }}
        onChange={onChange}
      />
    );
    expect(
      (screen.getByRole('button', { name: 'Adicionar Criança' }) as HTMLButtonElement).disabled
    ).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar Adulto' }));
    expect(onChange).toHaveBeenCalledWith({ child: 1, adult: 1 });
  });

  it('atração sem oferta publicada não mostra painel de reserva', async () => {
    vi.mocked(listPublishedOffersForItemUseCase).mockResolvedValue([]);
    const { container } = render(
      <BookingOfferPanel
        guideItemId="sight-public"
        isAuthenticated
        onRequireLogin={vi.fn()}
        onViewMyBookings={vi.fn()}
        renderPaymentElement={() => null}
      />
    );
    await waitFor(() =>
      expect(listPublishedOffersForItemUseCase).toHaveBeenCalledWith('sight-public')
    );
    expect(container.innerHTML).toBe('');
  });

  it('oferta publicada mostra a política de cancelamento antes da compra', async () => {
    const offer: PublicOffer = {
      id: 'offer-1',
      guideItemId: 'tour-1',
      kind: 'tour',
      status: 'published',
      title: { 'pt-BR': 'Passeio de buggy', en: 'Buggy tour' },
      pricing: { currency: 'BRL', priceOptions: OPTIONS },
      cancellationPolicy: 'moderate',
      maxParticipantsPerBooking: 6,
      requiresParticipantNames: false,
      updatedAt: '',
    };
    vi.mocked(listPublishedOffersForItemUseCase).mockResolvedValue([offer]);
    vi.mocked(listAvailableSlotsUseCase).mockResolvedValue([]);
    await i18n.changeLanguage('en');
    render(
      <BookingOfferPanel
        guideItemId="tour-1"
        isAuthenticated
        onRequireLogin={vi.fn()}
        onViewMyBookings={vi.fn()}
        renderPaymentElement={() => null}
      />
    );
    expect(await screen.findByText('Buggy tour')).toBeTruthy();
    expect(
      screen.getByText(/Full refund up to 5 days before the start; 50% up to 24 h before/)
    ).toBeTruthy();
    expect(screen.getByText(/Right of withdrawal: full refund if/)).toBeTruthy();
    await i18n.changeLanguage('pt-BR');
  });
});

describe('useBookingCheckout', () => {
  beforeEach(() => vi.clearAllMocks());

  it('reenviar usa a mesma chave; "tentar novamente" gera outra', async () => {
    vi.mocked(createBookingUseCase).mockRejectedValue(new Error('INSUFFICIENT_CAPACITY'));
    const { result } = renderHook(() => useBookingCheckout());
    const request = {
      offerId: 'o',
      slotId: 's',
      lines: [{ priceOptionId: 'adult', quantity: 1 }],
      participants: [],
    };
    await act(async () => {
      await result.current.start(request);
    });
    await act(async () => {
      await result.current.start(request);
    });
    const [first, second] = vi
      .mocked(createBookingUseCase)
      .mock.calls.map((call) => call[0].idempotencyKey);
    expect(first).toBe(second);
    act(() => result.current.reset());
    await act(async () => {
      await result.current.start(request);
    });
    expect(vi.mocked(createBookingUseCase).mock.calls[2]![0].idempotencyKey).not.toBe(first);
    expect(result.current.error).toBe('Não há vagas suficientes neste horário.');
  });
});

describe('previewRefund', () => {
  const startsAt = '2026-11-10T11:00:00.000Z';
  const booking = (
    cancellationPolicy: 'moderate' | 'none',
    createdAt = '2026-10-01T12:00:00.000Z'
  ) => ({
    kind: 'tour' as const,
    totalMinor: 20000,
    createdAt,
    offer: {
      title: 'Passeio',
      startsAt,
      durationMinutes: null,
      meetingPoint: null,
      cancellationPolicy,
    },
  });

  it('segue a política gravada fora do arrependimento: 100%, 50% e 0%', () => {
    expect(previewRefund(booking('moderate'), new Date('2026-11-04T11:00:00.000Z'))).toEqual({
      refundPercent: 100,
      refundAmountMinor: 20000,
    });
    expect(previewRefund(booking('moderate'), new Date('2026-11-08T11:00:00.000Z'))).toEqual({
      refundPercent: 50,
      refundAmountMinor: 10000,
    });
    expect(previewRefund(booking('moderate'), new Date('2026-11-10T00:00:00.000Z'))).toEqual({
      refundPercent: 0,
      refundAmountMinor: 0,
    });
  });

  it('arrependimento devolve tudo mesmo sem reembolso na política', () => {
    expect(
      previewRefund(
        booking('none', '2026-11-05T11:00:00.000Z'),
        new Date('2026-11-06T11:00:00.000Z')
      )
    ).toEqual({ refundPercent: 100, refundAmountMinor: 20000 });
  });
});
