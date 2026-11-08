import { describe, expect, it, vi } from 'vitest';
import type { PaymentGatewayPort } from '../ports/paymentGatewayPort';
import type { TransactionRepositoryPort } from '../ports/transactionRepositoryPort';
import { StripePaymentService } from './stripePaymentService';

const NOW = new Date('2026-10-25T12:00:00.000Z');

function setup(existingTx: unknown = null) {
  const gateway = {
    createPaymentIntent: vi.fn().mockResolvedValue({
      paymentIntentId: 'pi_1',
      clientSecret: 'secret_1',
      status: 'pending',
    }),
  } as unknown as PaymentGatewayPort;
  const accounts = {
    assertReady: vi.fn().mockResolvedValue({ accountKey: 'key-cnpj-1', stripeAccountId: 'acct_1' }),
  };
  const repo = {
    getTransactionByIdempotencyKey: vi.fn().mockResolvedValue(existingTx),
    saveTransactionRecord: vi.fn().mockResolvedValue({ id: 'pi_1' }),
    getTransaction: vi
      .fn()
      .mockResolvedValue({ id: 'pi_1', referenceType: 'booking', referenceId: 'bk_1' }),
  } as unknown as TransactionRepositoryPort;
  return {
    service: new StripePaymentService(gateway, repo, accounts, () => NOW),
    gateway,
    repo,
    accounts,
  };
}

const PARAMS = {
  referenceType: 'booking',
  referenceId: 'bk_1',
  buyerId: 'buyer-1',
  sellerPartnerId: 'p1',
  sellerAccountKey: 'key-cnpj-1',
  description: 'Use Guide — Passeio',
  serviceStartsAt: '2026-11-10T12:00:00.000Z',
  totalMinor: 20000,
  platformFeeMinor: 2000,
  idempotencyKey: 'pi_booking_bk_1',
};

describe('StripePaymentService — vendas de marketplace', () => {
  it('cobra na plataforma, sem destino, com o grupo do repasse e metadata só com IDs (D14)', async () => {
    const { service, gateway, repo, accounts } = setup();
    const result = await service.createMarketplacePaymentIntent(PARAMS);
    expect(accounts.assertReady).toHaveBeenCalledWith('key-cnpj-1');
    expect(gateway.createPaymentIntent).toHaveBeenCalledWith(
      expect.objectContaining({
        amountMinor: 20000,
        transferGroup: 'bk_1',
        paymentMethodTypes: ['card', 'pix'],
        idempotencyKey: 'pi_booking_bk_1',
        metadata: {
          referenceType: 'booking',
          referenceId: 'bk_1',
          partnerId: 'p1',
          accountKey: 'key-cnpj-1',
        },
      })
    );
    const call = vi.mocked(gateway.createPaymentIntent).mock.calls[0]?.[0];
    expect(call).not.toHaveProperty('connectedAccountId');
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
      sellerAccountKey: 'key-cnpj-1',
      eventListingId: 'event-1',
      occurrenceId: 'occ-1',
      eventTitle: 'Show',
      serviceStartsAt: '2027-03-01T22:00:00.000Z',
      totalMinor: 5000,
      platformFeeMinor: 500,
      idempotencyKey: 'pi_order_order-1',
    });
    expect(gateway.createPaymentIntent).toHaveBeenCalledWith(
      expect.objectContaining({
        description: 'Use Guide — Show',
        // Mais de 80 dias até o evento: sem Pix (o reembolso de Pix só vale até 90 dias).
        paymentMethodTypes: ['card'],
        metadata: {
          referenceType: 'ticket_order',
          referenceId: 'order-1',
          orderId: 'order-1',
          ticketOrderId: 'order-1',
          eventListingId: 'event-1',
          occurrenceId: 'occ-1',
          partnerId: 'p1',
          accountKey: 'key-cnpj-1',
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
