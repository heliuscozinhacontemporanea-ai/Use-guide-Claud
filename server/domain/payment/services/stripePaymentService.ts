import type {
  CreatePaymentIntentResult,
  PaymentGatewayPort,
  RefundPaymentResult,
  VerifiedWebhookEvent,
} from '../ports/paymentGatewayPort';
import type { TransactionRepositoryPort } from '../ports/transactionRepositoryPort';
import { paymentMethodsForService } from '../utils/payoutRules';
import type { PaymentAccountService } from './paymentAccountService';

export class PaymentDomainError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode = 400
  ) {
    super(message);
    this.name = 'PaymentDomainError';
  }
}

export class StripePaymentService {
  constructor(
    private readonly paymentGateway: PaymentGatewayPort,
    private readonly transactionRepo: TransactionRepositoryPort,
    private readonly paymentAccounts: Pick<PaymentAccountService, 'assertReady'>,
    private readonly now: () => Date = () => new Date()
  ) {}

  async createTicketOrderPaymentIntent(params: {
    orderId: string;
    buyerId: string;
    sellerPartnerId: string;
    sellerAccountKey: string;
    eventListingId: string;
    occurrenceId: string;
    eventTitle: string;
    serviceStartsAt: string;
    totalMinor: number;
    platformFeeMinor: number;
    idempotencyKey: string;
  }): Promise<CreatePaymentIntentResult & { transactionId: string }> {
    return this.createPlatformChargeIntent({
      referenceType: 'ticket_order',
      referenceId: params.orderId,
      buyerId: params.buyerId,
      sellerPartnerId: params.sellerPartnerId,
      sellerAccountKey: params.sellerAccountKey,
      description: `Use Guide — ${params.eventTitle}`,
      serviceStartsAt: params.serviceStartsAt,
      totalMinor: params.totalMinor,
      platformFeeMinor: params.platformFeeMinor,
      idempotencyKey: params.idempotencyKey,
      extraMetadata: {
        orderId: params.orderId,
        ticketOrderId: params.orderId,
        eventListingId: params.eventListingId,
        occurrenceId: params.occurrenceId,
      },
    });
  }

  /** Venda de marketplace genérica (cobrança na plataforma, D1 e D14); o chamador define a referência. */
  async createMarketplacePaymentIntent(params: {
    referenceType: string;
    referenceId: string;
    buyerId: string;
    sellerPartnerId: string;
    sellerAccountKey: string;
    description: string;
    serviceStartsAt: string;
    totalMinor: number;
    platformFeeMinor: number;
    idempotencyKey: string;
  }): Promise<CreatePaymentIntentResult & { transactionId: string }> {
    return this.createPlatformChargeIntent({ ...params, extraMetadata: {} });
  }

  /** Referência gravada na criação do pagamento (o objeto Dispute do Stripe não traz a metadata). */
  async getPaymentReference(
    paymentIntentId: string
  ): Promise<{ referenceType: string; referenceId: string } | null> {
    const record = await this.transactionRepo.getTransaction(paymentIntentId);
    if (!record?.referenceType || !record.referenceId) return null;
    return { referenceType: record.referenceType, referenceId: record.referenceId };
  }

  /**
   * Cobrança na plataforma, sem destino: o dinheiro fica no saldo do Use Guide e vai ao CNPJ pelo repasse,
   * 48 h depois do fim do serviço (separate charges and transfers, D14).
   */
  private async createPlatformChargeIntent(params: {
    referenceType: string;
    referenceId: string;
    buyerId: string;
    sellerPartnerId: string;
    /** Conta Stripe do CNPJ do estabelecimento que vende (D14). */
    sellerAccountKey: string;
    description: string;
    serviceStartsAt: string;
    totalMinor: number;
    platformFeeMinor: number;
    idempotencyKey: string;
    extraMetadata: Record<string, string>;
  }): Promise<CreatePaymentIntentResult & { transactionId: string }> {
    const existingTx = await this.transactionRepo.getTransactionByIdempotencyKey(
      params.idempotencyKey
    );
    if (
      existingTx?.providerPaymentId &&
      existingTx.paymentDetail &&
      typeof existingTx.paymentDetail.clientSecret === 'string'
    ) {
      return {
        transactionId: existingTx.id,
        paymentIntentId: existingTx.providerPaymentId,
        clientSecret: existingTx.paymentDetail.clientSecret,
        status: (existingTx.status as CreatePaymentIntentResult['status']) || 'pending',
      };
    }

    // Antes de cobrar, a conta do CNPJ precisa estar habilitada (AGENTS.md §8.1).
    await this.paymentAccounts.assertReady(params.sellerAccountKey);

    const result = await this.paymentGateway.createPaymentIntent({
      orderId: params.referenceId,
      amountMinor: params.totalMinor,
      currency: 'BRL',
      description: params.description,
      transferGroup: params.referenceId,
      paymentMethodTypes: paymentMethodsForService(params.serviceStartsAt, this.now()),
      metadata: {
        referenceType: params.referenceType,
        referenceId: params.referenceId,
        ...params.extraMetadata,
        partnerId: params.sellerPartnerId,
        accountKey: params.sellerAccountKey,
      },
      idempotencyKey: params.idempotencyKey,
    });

    const txRecord = await this.transactionRepo.saveTransactionRecord({
      transactionId: result.paymentIntentId,
      idempotencyKey: params.idempotencyKey,
      userId: params.buyerId,
      referenceType: params.referenceType,
      referenceId: params.referenceId,
      providerPaymentId: result.paymentIntentId,
      accountKey: params.sellerAccountKey,
      amountMinor: params.totalMinor,
      platformFeeMinor: params.platformFeeMinor,
      paymentMethod: 'stripe_payment_element',
      status: result.status,
      paymentResult: {
        paymentIntentId: result.paymentIntentId,
        clientSecret: result.clientSecret,
        referenceId: params.referenceId,
        partnerId: params.sellerPartnerId,
      },
    });

    return {
      ...result,
      transactionId: txRecord.id,
    };
  }

  async createPlanPaymentIntent(params: {
    buyerId: string;
    /** Estabelecimento que recebe o plano (D11). */
    itemId: string;
    planId: string;
    planName: string;
    amountMinor: number;
    idempotencyKey: string;
  }): Promise<CreatePaymentIntentResult & { transactionId: string }> {
    const existingTx = await this.transactionRepo.getTransactionByIdempotencyKey(
      params.idempotencyKey
    );
    if (
      existingTx?.providerPaymentId &&
      existingTx.paymentDetail &&
      typeof existingTx.paymentDetail.clientSecret === 'string'
    ) {
      return {
        transactionId: existingTx.id,
        paymentIntentId: existingTx.providerPaymentId,
        clientSecret: existingTx.paymentDetail.clientSecret,
        status: (existingTx.status as CreatePaymentIntentResult['status']) || 'pending',
      };
    }

    const result = await this.paymentGateway.createPaymentIntent({
      orderId: params.planId,
      amountMinor: params.amountMinor,
      currency: 'BRL',
      description: `Use Guide — Plano ${params.planName}`,
      paymentMethodTypes: ['card', 'pix'],
      metadata: {
        referenceType: 'plan_payment',
        planId: params.planId,
        partnerId: params.buyerId,
        itemId: params.itemId,
      },
      idempotencyKey: params.idempotencyKey,
    });

    const txRecord = await this.transactionRepo.saveTransactionRecord({
      transactionId: result.paymentIntentId,
      idempotencyKey: params.idempotencyKey,
      userId: params.buyerId,
      referenceType: 'plan_payment',
      referenceId: params.planId,
      providerPaymentId: result.paymentIntentId,
      amountMinor: params.amountMinor,
      platformFeeMinor: 0,
      paymentMethod: 'stripe_payment_element',
      status: result.status,
      paymentResult: {
        paymentIntentId: result.paymentIntentId,
        clientSecret: result.clientSecret,
        planId: params.planId,
        itemId: params.itemId,
      },
    });

    return {
      ...result,
      transactionId: txRecord.id,
    };
  }

  async refundPayment(params: {
    paymentIntentId: string;
    amountMinor?: number;
    idempotencyKey: string;
    metadata?: Record<string, string>;
  }): Promise<RefundPaymentResult> {
    return this.paymentGateway.refundPayment({
      paymentIntentId: params.paymentIntentId,
      amountMinor: params.amountMinor,
      idempotencyKey: params.idempotencyKey,
      metadata: params.metadata,
    });
  }

  async retrievePaymentIntent(paymentIntentId: string) {
    return this.paymentGateway.retrievePaymentIntent(paymentIntentId);
  }

  constructWebhookEvent(payload: string | Buffer, signature: string): VerifiedWebhookEvent {
    return this.paymentGateway.constructWebhookEvent(payload, signature);
  }

  async claimWebhookEvent(params: { eventId: string; eventType: string }) {
    return this.transactionRepo.claimWebhookEvent({ ...params, leaseMs: 5 * 60 * 1000 });
  }

  async completeWebhookEvent(eventId: string): Promise<void> {
    return this.transactionRepo.completeWebhookEvent(eventId);
  }

  async releaseWebhookEvent(eventId: string, errorMessage: string): Promise<void> {
    return this.transactionRepo.releaseWebhookEvent(eventId, errorMessage);
  }

  async updateTransactionStatus(
    paymentIntentId: string,
    status: string,
    statusDetail?: string
  ): Promise<boolean> {
    return this.transactionRepo.updateTransactionStatus(paymentIntentId, status, statusDetail);
  }
}
