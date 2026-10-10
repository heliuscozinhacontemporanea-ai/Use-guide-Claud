import type {
  ConnectedAccountStatus,
  MarketplaceAccountPort,
  StripeConnectedAccountRecord,
} from '../ports/marketplaceAccountPort';
import type {
  CreatePaymentIntentResult,
  PaymentGatewayPort,
  RefundPaymentResult,
  VerifiedWebhookEvent,
} from '../ports/paymentGatewayPort';
import type { TransactionRepositoryPort } from '../ports/transactionRepositoryPort';

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
    private readonly marketplaceAccount: MarketplaceAccountPort,
    private readonly transactionRepo: TransactionRepositoryPort
  ) {}

  async ensureConnectedAccount(params: {
    partnerId: string;
    email: string;
  }): Promise<StripeConnectedAccountRecord> {
    const existing = await this.transactionRepo.getConnectedAccountRecord(
      params.partnerId
    );
    const nowIso = new Date().toISOString();

    if (existing?.stripeAccountId) {
      const status = await this.marketplaceAccount.getAccountStatus(
        existing.stripeAccountId
      );
      const updated: StripeConnectedAccountRecord = {
        partnerId: params.partnerId,
        stripeAccountId: status.accountId,
        status: status.status,
        chargesEnabled: status.chargesEnabled,
        payoutsEnabled: status.payoutsEnabled,
        detailsSubmitted: status.detailsSubmitted,
        requirementsCurrentlyDue: status.requirementsCurrentlyDue,
        requirementsPastDue: status.requirementsPastDue,
        createdAt: existing.createdAt,
        updatedAt: nowIso,
      };
      await this.transactionRepo.saveConnectedAccountRecord(updated);
      return updated;
    }

    const created = await this.marketplaceAccount.createConnectedAccount({
      partnerId: params.partnerId,
      email: params.email,
      country: 'BR',
    });

    const status = await this.marketplaceAccount.getAccountStatus(
      created.accountId
    );

    const record: StripeConnectedAccountRecord = {
      partnerId: params.partnerId,
      stripeAccountId: created.accountId,
      status: status.status,
      chargesEnabled: status.chargesEnabled,
      payoutsEnabled: status.payoutsEnabled,
      detailsSubmitted: status.detailsSubmitted,
      requirementsCurrentlyDue: status.requirementsCurrentlyDue,
      requirementsPastDue: status.requirementsPastDue,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    await this.transactionRepo.saveConnectedAccountRecord(record);
    return record;
  }

  async createAccountSession(params: {
    partnerId: string;
    email: string;
  }): Promise<{ clientSecret: string }> {
    const record = await this.ensureConnectedAccount(params);
    return this.marketplaceAccount.createAccountSession(record.stripeAccountId);
  }

  async getPartnerAccountStatus(partnerId: string): Promise<{
    connected: boolean;
    accountId?: string;
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
    detailsSubmitted: boolean;
    status: ConnectedAccountStatus['status'];
  }> {
    const existing =
      await this.transactionRepo.getConnectedAccountRecord(partnerId);
    if (!existing || !existing.stripeAccountId) {
      return {
        connected: false,
        chargesEnabled: false,
        payoutsEnabled: false,
        detailsSubmitted: false,
        status: 'pending',
      };
    }

    const status = await this.marketplaceAccount.getAccountStatus(
      existing.stripeAccountId
    );
    const nowIso = new Date().toISOString();

    await this.transactionRepo.saveConnectedAccountRecord({
      partnerId,
      stripeAccountId: status.accountId,
      status: status.status,
      chargesEnabled: status.chargesEnabled,
      payoutsEnabled: status.payoutsEnabled,
      detailsSubmitted: status.detailsSubmitted,
      requirementsCurrentlyDue: status.requirementsCurrentlyDue,
      requirementsPastDue: status.requirementsPastDue,
      createdAt: existing.createdAt,
      updatedAt: nowIso,
    });

    return {
      connected: status.chargesEnabled && status.payoutsEnabled && status.detailsSubmitted,
      accountId: status.accountId,
      chargesEnabled: status.chargesEnabled,
      payoutsEnabled: status.payoutsEnabled,
      detailsSubmitted: status.detailsSubmitted,
      status: status.status,
    };
  }

  async assertPartnerReadyForPaidEvent(
    partnerId: string
  ): Promise<StripeConnectedAccountRecord> {
    const existing =
      await this.transactionRepo.getConnectedAccountRecord(partnerId);
    if (!existing || !existing.stripeAccountId) {
      throw new PaymentDomainError(
        'SELLER_ACCOUNT_NOT_ELIGIBLE',
        'Vendas online indisponíveis. Conclua a configuração financeira.',
        422
      );
    }

    const status = await this.marketplaceAccount.getAccountStatus(
      existing.stripeAccountId
    );
    const nowIso = new Date().toISOString();
    const synced: StripeConnectedAccountRecord = {
      partnerId,
      stripeAccountId: status.accountId,
      status: status.status,
      chargesEnabled: status.chargesEnabled,
      payoutsEnabled: status.payoutsEnabled,
      detailsSubmitted: status.detailsSubmitted,
      requirementsCurrentlyDue: status.requirementsCurrentlyDue,
      requirementsPastDue: status.requirementsPastDue,
      createdAt: existing.createdAt,
      updatedAt: nowIso,
    };
    await this.transactionRepo.saveConnectedAccountRecord(synced);

    if (
      !synced.chargesEnabled ||
      !synced.payoutsEnabled ||
      !synced.detailsSubmitted ||
      synced.status !== 'enabled'
    ) {
      throw new PaymentDomainError(
        'SELLER_ACCOUNT_NOT_ELIGIBLE',
        'Vendas online indisponíveis. Conclua a configuração financeira.',
        422
      );
    }

    return synced;
  }

  async createTicketOrderPaymentIntent(params: {
    orderId: string;
    buyerId: string;
    sellerPartnerId: string;
    eventListingId: string;
    occurrenceId: string;
    eventTitle: string;
    totalMinor: number;
    platformFeeMinor: number;
    idempotencyKey: string;
  }): Promise<CreatePaymentIntentResult & { transactionId: string }> {
    const existingTx =
      await this.transactionRepo.getTransactionByIdempotencyKey(
        params.idempotencyKey
      );
    if (
      existingTx &&
      existingTx.providerPaymentId &&
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

    const sellerAccount = await this.assertPartnerReadyForPaidEvent(
      params.sellerPartnerId
    );

    const result = await this.paymentGateway.createPaymentIntent({
      orderId: params.orderId,
      amountMinor: params.totalMinor,
      currency: 'BRL',
      description: `Use Guide — ${params.eventTitle}`,
      connectedAccountId: sellerAccount.stripeAccountId,
      applicationFeeMinor: params.platformFeeMinor,
      paymentMethodTypes: ['card', 'pix'],
      metadata: {
        referenceType: 'ticket_order',
        orderId: params.orderId,
        ticketOrderId: params.orderId,
        eventListingId: params.eventListingId,
        occurrenceId: params.occurrenceId,
        partnerId: params.sellerPartnerId,
      },
      idempotencyKey: params.idempotencyKey,
    });

    const txRecord = await this.transactionRepo.saveTransactionRecord({
      transactionId: result.paymentIntentId,
      idempotencyKey: params.idempotencyKey,
      userId: params.buyerId,
      referenceType: 'ticket_order',
      referenceId: params.orderId,
      providerPaymentId: result.paymentIntentId,
      connectedAccountId: sellerAccount.stripeAccountId,
      amountMinor: params.totalMinor,
      platformFeeMinor: params.platformFeeMinor,
      paymentMethod: 'stripe_payment_element',
      status: result.status,
      paymentResult: {
        paymentIntentId: result.paymentIntentId,
        clientSecret: result.clientSecret,
        orderId: params.orderId,
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
    planId: string;
    planName: string;
    amountMinor: number;
    idempotencyKey: string;
  }): Promise<CreatePaymentIntentResult & { transactionId: string }> {
    const existingTx =
      await this.transactionRepo.getTransactionByIdempotencyKey(
        params.idempotencyKey
      );
    if (
      existingTx &&
      existingTx.providerPaymentId &&
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
      applicationFeeMinor: 0,
      paymentMethodTypes: ['card', 'pix'],
      metadata: {
        referenceType: 'plan_payment',
        planId: params.planId,
        partnerId: params.buyerId,
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
    reverseTransfer?: boolean;
    refundApplicationFee?: boolean;
    idempotencyKey: string;
  }): Promise<RefundPaymentResult> {
    return this.paymentGateway.refundPayment({
      paymentIntentId: params.paymentIntentId,
      amountMinor: params.amountMinor,
      reverseTransfer: params.reverseTransfer ?? true,
      refundApplicationFee: params.refundApplicationFee ?? true,
      idempotencyKey: params.idempotencyKey,
    });
  }

  async retrievePaymentIntent(paymentIntentId: string) {
    return this.paymentGateway.retrievePaymentIntent(paymentIntentId);
  }

  constructWebhookEvent(
    payload: string | Buffer,
    signature: string
  ): VerifiedWebhookEvent {
    return this.paymentGateway.constructWebhookEvent(payload, signature);
  }

  async markWebhookEventProcessed(params: {
    eventId: string;
    eventType: string;
  }): Promise<boolean> {
    return this.transactionRepo.markWebhookEventProcessed(params);
  }

  async updateTransactionStatus(
    paymentIntentId: string,
    status: string,
    statusDetail?: string
  ): Promise<boolean> {
    return this.transactionRepo.updateTransactionStatus(
      paymentIntentId,
      status,
      statusDetail
    );
  }

  async syncConnectedAccountFromWebhook(stripeAccountId: string): Promise<void> {
    const existing =
      await this.transactionRepo.getConnectedAccountRecordByStripeAccountId(
        stripeAccountId
      );
    if (!existing) return;
    const status = await this.marketplaceAccount.getAccountStatus(stripeAccountId);
    await this.transactionRepo.saveConnectedAccountRecord({
      partnerId: existing.partnerId,
      stripeAccountId,
      status: status.status,
      chargesEnabled: status.chargesEnabled,
      payoutsEnabled: status.payoutsEnabled,
      detailsSubmitted: status.detailsSubmitted,
      requirementsCurrentlyDue: status.requirementsCurrentlyDue,
      requirementsPastDue: status.requirementsPastDue,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });
  }
}
