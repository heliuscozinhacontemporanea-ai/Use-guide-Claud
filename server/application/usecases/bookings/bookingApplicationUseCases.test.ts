import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../domain/bookings', async () => {
  const { BookingDomainError } = await import('../../../domain/bookings/errors/bookingDomainError');
  return {
    BookingDomainError,
    createPendingBookingUseCase: vi.fn(),
    cancelPendingBookingUseCase: vi.fn().mockResolvedValue({}),
    requestCancellationByBuyerUseCase: vi.fn(),
    cancelSlotByPartnerUseCase: vi.fn(),
    cancelBookingForCanceledSlotUseCase: vi.fn(),
  };
});
vi.mock('../../../domain/payment', () => ({
  createMarketplacePaymentIntentUseCase: vi.fn(),
  processProviderRefundUseCase: vi.fn().mockResolvedValue({}),
}));

import {
  cancelBookingForCanceledSlotUseCase,
  cancelPendingBookingUseCase,
  cancelSlotByPartnerUseCase,
  createPendingBookingUseCase,
  requestCancellationByBuyerUseCase,
} from '../../../domain/bookings';
import {
  createMarketplacePaymentIntentUseCase,
  processProviderRefundUseCase,
} from '../../../domain/payment';
import { cancelBookingByBuyerApplicationUseCase } from './cancelBookingByBuyerApplicationUseCase';
import { cancelSlotByPartnerApplicationUseCase } from './cancelSlotByPartnerApplicationUseCase';
import { createBookingApplicationUseCase } from './createBookingApplicationUseCase';

const BOOKING = {
  id: 'bk_1',
  status: 'pending_payment',
  sellerPartnerId: 'p1',
  totalMinor: 20000,
  platformFeeMinor: 2000,
  expiresAt: '2026-11-01T12:15:00.000Z',
  paymentIntentId: 'pi_1',
  offerSnapshot: { title: 'Passeio' },
};
const INPUT = {
  offerId: 'offer-1',
  slotId: 'slot-1',
  lines: [{ priceOptionId: 'adult', quantity: 2 }],
  participants: [],
  idempotencyKey: 'key-12345',
  locale: 'pt-BR' as const,
};
const BUYER = { uid: 'buyer-1', admin: false, emailVerified: true };

describe('createBookingApplicationUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('e-mail não verificado → EMAIL_NOT_VERIFIED, sem reservar vaga', async () => {
    await expect(
      createBookingApplicationUseCase({ ...BUYER, emailVerified: false }, INPUT)
    ).rejects.toMatchObject({ code: 'EMAIL_NOT_VERIFIED', statusCode: 403 });
    expect(createPendingBookingUseCase).not.toHaveBeenCalled();
  });

  it('cria o pagamento com chave idempotente derivada da reserva', async () => {
    vi.mocked(createPendingBookingUseCase).mockResolvedValue(BOOKING as never);
    vi.mocked(createMarketplacePaymentIntentUseCase).mockResolvedValue({
      clientSecret: 'secret',
    } as never);
    const result = await createBookingApplicationUseCase(BUYER, INPUT);
    expect(createMarketplacePaymentIntentUseCase).toHaveBeenCalledWith(
      expect.objectContaining({
        referenceType: 'booking',
        referenceId: 'bk_1',
        sellerPartnerId: 'p1',
        totalMinor: 20000,
        platformFeeMinor: 2000,
        idempotencyKey: 'pi_booking_bk_1',
      })
    );
    expect(result).toEqual({
      bookingId: 'bk_1',
      status: 'pending_payment',
      clientSecret: 'secret',
      totalMinor: 20000,
      expiresAt: '2026-11-01T12:15:00.000Z',
    });
  });

  it('falha ao criar o pagamento libera a vaga e repassa o erro', async () => {
    vi.mocked(createPendingBookingUseCase).mockResolvedValue(BOOKING as never);
    vi.mocked(createMarketplacePaymentIntentUseCase).mockRejectedValue(new Error('stripe down'));
    await expect(createBookingApplicationUseCase(BUYER, INPUT)).rejects.toThrow('stripe down');
    expect(cancelPendingBookingUseCase).toHaveBeenCalledWith('bk_1', 'payment_init_failed');
  });
});

describe('cancelBookingByBuyerApplicationUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('100% devolve também a taxa da plataforma', async () => {
    vi.mocked(requestCancellationByBuyerUseCase).mockResolvedValue({
      booking: { ...BOOKING, status: 'canceled' },
      refundPercent: 100,
      refundAmountMinor: 20000,
    } as never);
    await cancelBookingByBuyerApplicationUseCase({ uid: 'buyer-1', admin: false }, 'bk_1', '');
    expect(processProviderRefundUseCase).toHaveBeenCalledWith({
      paymentIntentId: 'pi_1',
      amountMinor: 20000,
      reverseTransfer: true,
      refundApplicationFee: true,
      idempotencyKey: 'refund_booking_bk_1',
      metadata: { referenceType: 'booking_refund', bookingId: 'bk_1' },
    });
  });

  it('50% não devolve a taxa', async () => {
    vi.mocked(requestCancellationByBuyerUseCase).mockResolvedValue({
      booking: { ...BOOKING, status: 'canceled' },
      refundPercent: 50,
      refundAmountMinor: 10000,
    } as never);
    await cancelBookingByBuyerApplicationUseCase({ uid: 'buyer-1', admin: false }, 'bk_1', '');
    expect(processProviderRefundUseCase).toHaveBeenCalledWith(
      expect.objectContaining({ amountMinor: 10000, refundApplicationFee: false })
    );
  });

  it('0% não chama o Stripe', async () => {
    vi.mocked(requestCancellationByBuyerUseCase).mockResolvedValue({
      booking: { ...BOOKING, status: 'canceled' },
      refundPercent: 0,
      refundAmountMinor: 0,
    } as never);
    await expect(
      cancelBookingByBuyerApplicationUseCase({ uid: 'buyer-1', admin: false }, 'bk_1', '')
    ).resolves.toEqual({ status: 'canceled', refundPercent: 0, refundAmountMinor: 0 });
    expect(processProviderRefundUseCase).not.toHaveBeenCalled();
  });
});

describe('cancelSlotByPartnerApplicationUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('reembolsa por inteiro as reservas pagas e conta as falhas', async () => {
    vi.mocked(cancelSlotByPartnerUseCase).mockResolvedValue([
      { id: 'bk_1' },
      { id: 'bk_2' },
      { id: 'bk_3' },
    ] as never);
    vi.mocked(cancelBookingForCanceledSlotUseCase)
      .mockResolvedValueOnce({
        id: 'bk_1',
        paymentIntentId: 'pi_1',
        cancellation: { refundAmountMinor: 20000 },
      } as never)
      .mockResolvedValueOnce({ id: 'bk_2', cancellation: { refundAmountMinor: 0 } } as never)
      .mockResolvedValueOnce({
        id: 'bk_3',
        paymentIntentId: 'pi_3',
        cancellation: { refundAmountMinor: 5000 },
      } as never);
    vi.mocked(processProviderRefundUseCase)
      .mockResolvedValueOnce({} as never)
      .mockRejectedValueOnce(new Error('stripe down'));
    const result = await cancelSlotByPartnerApplicationUseCase(
      { uid: 'p1', admin: false },
      'offer-1',
      'slot-1'
    );
    expect(result).toEqual({ canceledBookings: 3, refundsRequested: 1, failedRefunds: 1 });
    expect(processProviderRefundUseCase).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentIntentId: 'pi_1',
        refundApplicationFee: true,
        reverseTransfer: true,
        idempotencyKey: 'refund_slot_bk_1',
      })
    );
  });
});
