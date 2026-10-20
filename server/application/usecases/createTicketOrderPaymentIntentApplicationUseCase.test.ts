import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getOrder: vi.fn(),
  getListing: vi.fn(),
  createPayment: vi.fn(),
  assertCanSell: vi.fn(),
}));

vi.mock('../../domain/ticketing', async () => {
  const { TicketingDomainError } = await import(
    '../../domain/ticketing/errors/ticketingDomainError'
  );
  return {
    TicketingDomainError,
    getTicketOrderUseCase: mocks.getOrder,
    confirmTicketOrderPaymentUseCase: vi.fn(),
  };
});
vi.mock('../../domain/events', () => ({ getEventListingByIdUseCase: mocks.getListing }));
vi.mock('../../domain/payment', () => ({
  createPaymentForTicketOrderUseCase: mocks.createPayment,
}));
vi.mock('../../domain/partners', async () => {
  const { ListingVerificationError } = await import(
    '../../domain/partners/errors/listingVerificationError'
  );
  return { ListingVerificationError, assertListingCanSellUseCase: mocks.assertCanSell };
});
vi.mock('./isPartnerSuspended', () => ({ isPartnerSuspended: vi.fn().mockResolvedValue(false) }));

import { ListingVerificationError } from '../../domain/partners/errors/listingVerificationError';
import { createTicketOrderPaymentIntentApplicationUseCase } from './createTicketOrderPaymentIntentApplicationUseCase';

const ORDER = {
  id: 'ord-1',
  buyerId: 'buyer-1',
  status: 'pending_payment',
  totalMinor: 5000,
  platformFeeMinor: 500,
  eventListingId: 'ev-1',
  occurrenceId: 'oc-1',
  expiresAt: null,
};

describe('createTicketOrderPaymentIntentApplicationUseCase (D12)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getOrder.mockResolvedValue({ order: ORDER });
    mocks.getListing.mockResolvedValue({
      id: 'ev-1',
      ownerId: 'p1',
      establishmentId: 'item-1',
      title: 'Luau',
    });
    mocks.createPayment.mockResolvedValue({
      paymentIntentId: 'pi_1',
      clientSecret: 'cs',
      status: 'requires_payment_method',
    });
  });

  it('confere a verificação do estabelecimento do evento antes de cobrar', async () => {
    await createTicketOrderPaymentIntentApplicationUseCase(
      { uid: 'buyer-1' },
      { orderId: 'ord-1', idempotencyKey: 'k-12345678' }
    );
    expect(mocks.assertCanSell).toHaveBeenCalledWith('item-1');
    expect(mocks.createPayment).toHaveBeenCalled();
  });

  it('estabelecimento não verificado: não cria o pagamento', async () => {
    mocks.assertCanSell.mockRejectedValueOnce(
      new ListingVerificationError('LISTING_NOT_VERIFIED', 'x')
    );
    await expect(
      createTicketOrderPaymentIntentApplicationUseCase(
        { uid: 'buyer-1' },
        { orderId: 'ord-1', idempotencyKey: 'k-12345678' }
      )
    ).rejects.toMatchObject({ code: 'UNPROCESSABLE_ENTITY' });
    expect(mocks.createPayment).not.toHaveBeenCalled();
  });
});
