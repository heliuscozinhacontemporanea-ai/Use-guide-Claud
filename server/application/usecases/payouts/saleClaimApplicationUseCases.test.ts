import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../domain/bookings', () => ({ getBookingUseCase: vi.fn() }));
vi.mock('../../../domain/events', () => ({
  getEventListingByIdUseCase: vi.fn().mockResolvedValue({ ownerId: 'partner-1' }),
}));
vi.mock('../../../domain/notifications', () => ({
  createNotificationUseCase: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('../../../domain/ticketing', () => ({ getTicketOrderUseCase: vi.fn() }));
vi.mock('../../../domain/payment', async () => {
  const { PaymentDomainError } = await import(
    '../../../domain/payment/services/stripePaymentService'
  );
  return {
    PaymentDomainError,
    openSaleClaimUseCase: vi.fn(async (input: Record<string, unknown>) => ({
      ...input,
      id: 'claim_x',
      status: 'open',
      openedAt: 'a',
      decideBy: 'b',
    })),
    getSaleClaimUseCase: vi.fn(),
    decideSaleClaimUseCase: vi.fn().mockResolvedValue({ id: 'claim_x', status: 'refunded' }),
  };
});
vi.mock('./chargeCancellationPenaltyApplicationUseCase', () => ({
  chargeCancellationPenaltyApplicationUseCase: vi.fn().mockResolvedValue(2000),
}));

import { getBookingUseCase } from '../../../domain/bookings';
import { createNotificationUseCase } from '../../../domain/notifications';
import {
  decideSaleClaimUseCase,
  getSaleClaimUseCase,
  openSaleClaimUseCase,
} from '../../../domain/payment';
import { getTicketOrderUseCase } from '../../../domain/ticketing';
import { chargeCancellationPenaltyApplicationUseCase } from './chargeCancellationPenaltyApplicationUseCase';
import { decideSaleClaimApplicationUseCase } from './decideSaleClaimApplicationUseCase';
import { openSaleClaimApplicationUseCase } from './openSaleClaimApplicationUseCase';

const BUYER = { uid: 'buyer-1' };
const ORDER = {
  id: 'ord_1',
  buyerId: 'buyer-1',
  status: 'paid',
  eventListingId: 'ev-1',
  eventSnapshot: {
    title: 'Show',
    startsAt: '2026-12-20T22:00:00.000Z',
    endsAt: '2026-12-21T03:00:00.000Z',
  },
};

describe('openSaleClaimApplicationUseCase (D16)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('ingresso: datas da sessão, e o parceiro é avisado sem o texto do comprador', async () => {
    vi.mocked(getTicketOrderUseCase).mockResolvedValue({ order: ORDER } as never);
    await openSaleClaimApplicationUseCase(BUYER, {
      referenceType: 'ticket_order',
      referenceId: 'ord_1',
      reason: 'other',
      details: 'texto privado',
    });
    expect(openSaleClaimUseCase).toHaveBeenCalledWith(
      expect.objectContaining({
        buyerUid: 'buyer-1',
        serviceStartsAt: ORDER.eventSnapshot.startsAt,
        serviceEndsAt: ORDER.eventSnapshot.endsAt,
      })
    );
    expect(createNotificationUseCase).toHaveBeenCalledWith(
      expect.objectContaining({ recipientPartnerId: 'partner-1' })
    );
    expect(JSON.stringify(vi.mocked(createNotificationUseCase).mock.calls)).not.toContain(
      'texto privado'
    );
  });

  it('pedido de outra pessoa (IDOR), mesmo do dono do evento: 404', async () => {
    vi.mocked(getTicketOrderUseCase).mockResolvedValue({
      order: { ...ORDER, buyerId: 'buyer-2' },
    } as never);
    await expect(
      openSaleClaimApplicationUseCase(BUYER, {
        referenceType: 'ticket_order',
        referenceId: 'ord_1',
        reason: 'did_not_happen',
      })
    ).rejects.toMatchObject({ code: 'NOT_FOUND', statusCode: 404 });
    expect(openSaleClaimUseCase).not.toHaveBeenCalled();
  });

  it('reserva: fim = início + duração; pendente de pagamento não reclama', async () => {
    const booking = {
      id: 'bk_1',
      buyerId: 'buyer-1',
      sellerPartnerId: 'partner-2',
      status: 'completed',
      offerSnapshot: { startsAt: '2026-12-20T12:00:00.000Z', durationMinutes: 90 },
    };
    vi.mocked(getBookingUseCase).mockResolvedValue(booking as never);
    await openSaleClaimApplicationUseCase(BUYER, {
      referenceType: 'booking',
      referenceId: 'bk_1',
      reason: 'not_as_described',
    });
    expect(openSaleClaimUseCase).toHaveBeenCalledWith(
      expect.objectContaining({ serviceEndsAt: '2026-12-20T13:30:00.000Z' })
    );
    vi.mocked(getBookingUseCase).mockResolvedValue({
      ...booking,
      status: 'pending_payment',
    } as never);
    await expect(
      openSaleClaimApplicationUseCase(BUYER, {
        referenceType: 'booking',
        referenceId: 'bk_1',
        reason: 'not_as_described',
      })
    ).rejects.toMatchObject({ code: 'CLAIM_NOT_ALLOWED' });
  });
});

describe('decideSaleClaimApplicationUseCase (D16)', () => {
  beforeEach(() => vi.clearAllMocks());

  const CLAIM = {
    id: 'claim_x',
    reason: 'did_not_happen',
    status: 'open',
    referenceType: 'booking',
    referenceId: 'bk_1',
  };

  it('multa do cancelamento silencioso antes do reembolso integral', async () => {
    vi.mocked(getSaleClaimUseCase).mockResolvedValue(CLAIM as never);
    await decideSaleClaimApplicationUseCase('admin-1', 'claim_x', {
      outcome: 'refund_full',
      chargePenalty: true,
    });
    expect(chargeCancellationPenaltyApplicationUseCase).toHaveBeenCalledWith({
      referenceType: 'sale_claim',
      referenceId: 'claim_x',
      sales: [{ referenceType: 'booking', referenceId: 'bk_1' }],
    });
    expect(
      vi.mocked(chargeCancellationPenaltyApplicationUseCase).mock.invocationCallOrder[0]
    ).toBeLessThan(vi.mocked(decideSaleClaimUseCase).mock.invocationCallOrder[0] ?? 0);
    expect(decideSaleClaimUseCase).toHaveBeenCalledWith('claim_x', 'admin-1', {
      outcome: 'refund_full',
    });
  });

  it('multa só com "não aconteceu" e reembolso integral', async () => {
    vi.mocked(getSaleClaimUseCase).mockResolvedValue({
      ...CLAIM,
      reason: 'not_as_described',
    } as never);
    await expect(
      decideSaleClaimApplicationUseCase('admin-1', 'claim_x', {
        outcome: 'refund_full',
        chargePenalty: true,
      })
    ).rejects.toMatchObject({ code: 'PENALTY_NOT_ALLOWED' });
    expect(chargeCancellationPenaltyApplicationUseCase).not.toHaveBeenCalled();
    expect(decideSaleClaimUseCase).not.toHaveBeenCalled();
  });
});
