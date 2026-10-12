import { describe, expect, it, vi } from 'vitest';
import type { MarketplaceAccountPort } from '../ports/marketplaceAccountPort';
import type { PaymentGatewayPort } from '../ports/paymentGatewayPort';
import type { TransactionRepositoryPort } from '../ports/transactionRepositoryPort';
import { StripePaymentService } from './stripePaymentService';

function setup(existingTx: unknown = null) {
  const gateway = {
    createPaymentIntent: vi.fn().mockResolvedValue({
      paymentIntentId: 'pi_1',
      clientSecret: 'secret_1',
      status: 'pending',
    }),
  } as unknown as PaymentGatewayPort;
  const account = {
    getAccountStatus: vi.fn().mockResolvedValue({
      accountId: 'acct_1',
      status: 'enabled',
      chargesEnabled: true,
      payoutsEnabled: true,
      detailsSubmitted: true,
      requirementsCurrentlyDue: [],
      requirementsPastDue: [],
    }),
  } as unknown as MarketplaceAccountPort;
  const repo = {
    getTransactionByIdempotencyKey: vi.fn().mockResolvedValue(existingTx),
    getConnectedAccountRecord: vi
      .fn()
      .mockResolvedValue({ partnerId: 'p1', stripeAccountId: 'acct_1', createdAt: '' }),
    saveConnectedAccountRecord: vi.fn().mockResolvedValue(undefined),
    saveTransactionRecord: vi.fn().mockResolvedValue({ id: 'pi_1' }),
    getTransaction: vi
      .fn()
      .mockResolvedValue({ id: 'pi_1', referenceType: 'booking', referenceId: 'bk_1' }),
  } as unknown as TransactionRepositoryPort;
  return { service: new StripePaymentService(gateway, account, repo), gateway, repo };
}

const PARAMS = {
  referenceType: 'booking',
  referenceId: 'bk_1',
  buyerId: 'buyer-1',
  sellerPartnerId: 'p1',
  description: 'Use Guide — Passeio',
  totalMinor: 20000,
  platformFeeMinor: 2000,
  idempotencyKey: 'pi_booking_bk_1',
};

describe('StripePaymentService — vendas de marketplace', () => {
  it('cria destination charge com taxa e metadata só com IDs', async () => {
    const { service, gateway, repo } = setup();
    const result = await service.createMarketplacePaymentIntent(PARAMS);
    expect(gateway.createPaymentIntent).toHaveBeenCalledWith(
      expect.objectContaining({
        amountMinor: 20000,
        applicationFeeMinor: 2000,
        connectedAccountId: 'acct_1',
        idempotencyKey: 'pi_booking_bk_1',
        metadata: { referenceType: 'booking', referenceId: 'bk_1', partnerId: 'p1' },
      })
    );
    expect(repo.saveTransactionRecord).toHaveBeenCalledWith(
      expect.objectContaining({ referenceType: 'booking', referenceId: 'bk_1' })
    );
    expect(result).toMatchObject({ paymentIntentId: 'pi_1', clientSecret: 'secret_1' });
  });

  it('mesma chave de idempotência devolve o pagamento já criado sem chamar o Stripe', async () => {
    const { service, gateway } = setup({
      id: 'pi_1',
      providerPaymentId: 'pi_1',
      status: 'pending',
      paymentDetail: { clientSecret: 'secret_1' },
    });
    await expect(service.createMarketplacePaymentIntent(PARAMS)).resolves.toMatchObject({
      clientSecret: 'secret_1',
    });
    expect(gateway.createPaymentIntent).not.toHaveBeenCalled();
  });

  it('pedido de ingresso mantém a metadata do ingresso', async () => {
    const { service, gateway } = setup();
    await service.createTicketOrderPaymentIntent({
      orderId: 'order-1',
      buyerId: 'buyer-1',
      sellerPartnerId: 'p1',
      eventListingId: 'event-1',
      occurrenceId: 'occ-1',
      eventTitle: 'Show',
      totalMinor: 5000,
      platformFeeMinor: 500,
      idempotencyKey: 'pi_order_order-1',
    });
    expect(gateway.createPaymentIntent).toHaveBeenCalledWith(
      expect.objectContaining({
        description: 'Use Guide — Show',
        metadata: {
          referenceType: 'ticket_order',
          referenceId: 'order-1',
          orderId: 'order-1',
          ticketOrderId: 'order-1',
          eventListingId: 'event-1',
          occurrenceId: 'occ-1',
          partnerId: 'p1',
        },
      })
    );
  });

  it('referência do pagamento vem da transação gravada', async () => {
    const { service } = setup();
    await expect(service.getPaymentReference('pi_1')).resolves.toEqual({
      referenceType: 'booking',
      referenceId: 'bk_1',
    });
  });
});
