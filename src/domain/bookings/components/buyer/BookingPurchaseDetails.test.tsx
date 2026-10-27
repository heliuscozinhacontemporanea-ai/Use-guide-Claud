import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';
import type { BookingPurchasesSource } from '../../hooks/useBookingPurchases';
import type { BookingSummary } from '../../types/bookings';
import { bookingPurchaseSection } from '../../utils/bookingPurchaseSection';
import { BookingPurchaseDetails } from './BookingPurchaseDetails';

const NOW = new Date('2026-11-01T12:00:00.000Z');

function booking(overrides: Partial<BookingSummary> = {}): BookingSummary {
  return {
    id: 'bk_0123456789xyz',
    offerId: 'of_1',
    slotId: 'sl_1',
    guideItemId: 'it_1',
    kind: 'tour',
    status: 'confirmed',
    lines: [{ priceOptionId: 'adult', quantity: 2, unitAmountMinor: 18000 }],
    participantsCount: 2,
    totalMinor: 36000,
    expiresAt: null,
    offer: {
      title: 'Passeio de barco',
      startsAt: '2026-11-20T12:00:00.000Z',
      durationMinutes: 120,
      meetingPoint: 'Praça Principal',
      cancellationPolicy: 'moderate',
    },
    cancellation: null,
    rescheduledAt: null,
    createdAt: '2026-10-01T12:00:00.000Z',
    ...overrides,
  };
}

function source(data: BookingSummary[]): BookingPurchasesSource {
  return {
    data,
    entries: [],
    loading: false,
    error: null,
    hasMore: false,
    reload: vi.fn(async () => undefined),
    loadMore: vi.fn(async () => undefined),
    cancel: vi.fn(async () => ({
      status: 'canceled',
      refundPercent: 100,
      refundAmountMinor: 36000,
    })),
  } as unknown as BookingPurchasesSource;
}

function renderDetails(target: BookingSummary) {
  const src = source([target]);
  render(
    <BookingPurchaseDetails
      source={src}
      bookingId={target.id}
      onClose={vi.fn()}
      onViewBooking={vi.fn()}
      onNotice={vi.fn()}
    />
  );
  return src;
}

describe('folha da reserva em Compras', () => {
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW);
    await i18n.changeLanguage('pt-BR');
  });
  afterEach(() => vi.useRealTimers());

  it('a folha não mostra o valor do reembolso; a confirmação mostra valor, motivo e prazo', () => {
    const src = renderDetails(booking());
    expect(screen.getByText(/#bk_0123456 · comprado em/)).toBeTruthy();
    expect(screen.queryByText('Reembolso')).toBeNull();
    expect(screen.queryByText(/Vale até/)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar compra' }));
    expect(screen.getByText('Reembolso')).toBeTruthy();
    expect(screen.getByText(/R\$\s?360,00/, { selector: 'p.text-2xl' })).toBeTruthy();
    expect(screen.getByText(/Pela política Moderada, você recebe 100% do valor/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Manter compra' }));
    expect(src.cancel).not.toHaveBeenCalled();
  });

  it('depois do prazo não oferece cancelar: a reserva continua valendo', () => {
    renderDetails(booking({ offer: { ...booking().offer, startsAt: '2026-11-02T00:00:00.000Z' } }));
    expect(screen.queryByRole('button', { name: 'Cancelar compra' })).toBeNull();
    expect(screen.getByText(/Sua reserva continua valendo/)).toBeTruthy();
  });

  it('confirmar cancela pela API e recarrega', async () => {
    const src = renderDetails(booking());
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar compra' }));
    const buttons = screen.getAllByRole('button', { name: 'Cancelar compra' });
    fireEvent.click(buttons[buttons.length - 1] as HTMLElement);
    await vi.waitFor(() => expect(src.reload).toHaveBeenCalled());
    expect(src.cancel).toHaveBeenCalledWith('bk_0123456789xyz');
  });
});

describe('seção da reserva no histórico', () => {
  it('paga em Finalizadas, esperando pagamento em Pendentes, expirada ou devolvida em Canceladas', () => {
    expect(bookingPurchaseSection(booking(), NOW)).toBe('done');
    expect(bookingPurchaseSection(booking({ status: 'no_show' }), NOW)).toBe('done');
    expect(
      bookingPurchaseSection(
        booking({ status: 'pending_payment', expiresAt: '2026-11-01T12:10:00.000Z' }),
        NOW
      )
    ).toBe('pending');
    expect(
      bookingPurchaseSection(
        booking({ status: 'pending_payment', expiresAt: '2026-11-01T11:50:00.000Z' }),
        NOW
      )
    ).toBe('canceled');
    expect(bookingPurchaseSection(booking({ status: 'refunded' }), NOW)).toBe('canceled');
  });
});
