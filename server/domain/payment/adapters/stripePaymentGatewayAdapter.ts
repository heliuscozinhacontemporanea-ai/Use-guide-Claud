import Stripe from 'stripe';
import type {
  CreatePaymentIntentInput,
  CreatePaymentIntentResult,
  PaymentGatewayPort,
  RefundPaymentInput,
  RefundPaymentResult,
  VerifiedWebhookEvent,
} from '../ports/paymentGatewayPort';

export class StripePaymentGatewayAdapter implements PaymentGatewayPort {
  private stripeClient: Stripe | null = null;
  private readonly explicitSecretKey?: string;

  constructor(secretKey?: string) {
    this.explicitSecretKey = secretKey;
  }

  private get stripe(): Stripe {
    if (!this.stripeClient) {
      const secretKey = this.explicitSecretKey || process.env.STRIPE_SECRET_KEY;
      if (!secretKey) {
        throw new Error('STRIPE_SECRET_KEY não configurada.');
      }
      this.stripeClient = new Stripe(secretKey);
    }
    return this.stripeClient;
  }

  async createPaymentIntent(
    input: CreatePaymentIntentInput
  ): Promise<CreatePaymentIntentResult> {
    const params: Stripe.PaymentIntentCreateParams = {
      amount: input.amountMinor,
      currency: 'brl',
      automatic_payment_methods: {
        enabled: true,
      },
      description: input.description,
      metadata: input.metadata,
      ...(input.connectedAccountId
        ? {
            transfer_data: {
              destination: input.connectedAccountId,
            },
          }
        : {}),
    };

    if (input.connectedAccountId && input.applicationFeeMinor > 0) {
      params.application_fee_amount = input.applicationFeeMinor;
    }

    const paymentIntent = await this.stripe.paymentIntents.create(params, {
      idempotencyKey: input.idempotencyKey,
    });

    if (!paymentIntent.client_secret) {
      throw new Error('Stripe não retornou client_secret.');
    }

    return {
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      status: this.mapStatus(paymentIntent.status),
    };
  }

  async retrievePaymentIntent(paymentIntentId: string) {
    const paymentIntent =
      await this.stripe.paymentIntents.retrieve(paymentIntentId);
    return {
      id: paymentIntent.id,
      status: paymentIntent.status,
      amountMinor: paymentIntent.amount,
      metadata: paymentIntent.metadata,
    };
  }

  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentResult> {
    const refund = await this.stripe.refunds.create(
      {
        payment_intent: input.paymentIntentId,
        ...(input.amountMinor !== undefined
          ? {
              amount: input.amountMinor,
            }
          : {}),
        reverse_transfer: input.reverseTransfer,
        refund_application_fee: input.refundApplicationFee,
      },
      {
        idempotencyKey: input.idempotencyKey,
      }
    );

    return {
      providerRefundId: refund.id ?? null,
      status: this.mapRefundStatus(refund.status),
    };
  }

  constructWebhookEvent(
    payload: string | Buffer,
    signature: string
  ): VerifiedWebhookEvent {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET não configurada.');
    }

    const event = this.stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    );

    return {
      id: event.id,
      type: event.type,
      account: event.account,
      created: event.created,
      dataObject:
        (event.data?.object as unknown as Record<string, unknown>) || {},
    };
  }

  private mapStatus(status: Stripe.PaymentIntent.Status) {
    switch (status) {
      case 'succeeded':
        return 'succeeded' as const;
      case 'processing':
        return 'processing' as const;
      case 'requires_payment_method':
      case 'requires_confirmation':
      case 'requires_action':
        return 'pending' as const;
      case 'canceled':
        return 'canceled' as const;
      default:
        return 'failed' as const;
    }
  }

  private mapRefundStatus(status: string | null) {
    switch (status) {
      case 'succeeded':
        return 'succeeded' as const;
      case 'pending':
        return 'pending' as const;
      default:
        return 'failed' as const;
    }
  }
}
