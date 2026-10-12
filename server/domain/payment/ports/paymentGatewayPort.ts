export type PaymentMethod = 'card' | 'pix';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'canceled'
  | 'refunded'
  | 'disputed';

export type PaymentReference =
  | {
      type: 'ticket_order';
      id: string;
    }
  | {
      type: 'plan_payment';
      id: string;
    };

export interface PaymentTransaction {
  id: string;
  /** Quem vendeu o quê (ex: 'ticket_order', 'booking'); o payment não interpreta o valor. */
  referenceType: string;
  referenceId: string;
  provider: 'stripe';
  providerPaymentId: string;
  connectedAccountId?: string;
  amountMinor: number;
  platformFeeMinor: number;
  currency: 'BRL';
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentIntentInput {
  orderId: string;
  amountMinor: number;
  currency: 'BRL';
  description: string;
  connectedAccountId?: string;
  applicationFeeMinor: number;
  paymentMethodTypes: PaymentMethod[];
  metadata: Record<string, string>;
  idempotencyKey: string;
}

export interface CreatePaymentIntentResult {
  paymentIntentId: string;
  clientSecret: string;
  status: PaymentStatus;
}

export interface RefundPaymentInput {
  paymentIntentId: string;
  amountMinor?: number;
  reverseTransfer: boolean;
  refundApplicationFee: boolean;
  idempotencyKey: string;
  metadata?: Record<string, string>;
}

export interface RefundPaymentResult {
  providerRefundId: string | null;
  status: 'pending' | 'succeeded' | 'failed';
}

export interface VerifiedWebhookEvent {
  id: string;
  type: string;
  account?: string;
  created: number;
  dataObject: Record<string, unknown>;
}

export interface PaymentGatewayPort {
  createPaymentIntent(
    input: CreatePaymentIntentInput
  ): Promise<CreatePaymentIntentResult>;
  refundPayment(input: RefundPaymentInput): Promise<RefundPaymentResult>;
  retrievePaymentIntent(paymentIntentId: string): Promise<{
    id: string;
    status: string;
    amountMinor: number;
    metadata: Record<string, string>;
  }>;
  constructWebhookEvent(
    payload: string | Buffer,
    signature: string
  ): VerifiedWebhookEvent;
}
