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
  /** Índice cego do CNPJ que recebe o repasse (D14). */
  accountKey?: string;
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
  /** Liga a cobrança às transferências do repasse (separate charges and transfers, D14). */
  transferGroup?: string;
  /** Métodos aceitos; sem Pix quando o serviço passa de 80 dias (D14). */
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
  createPaymentIntent(input: CreatePaymentIntentInput): Promise<CreatePaymentIntentResult>;
  refundPayment(input: RefundPaymentInput): Promise<RefundPaymentResult>;
  retrievePaymentIntent(paymentIntentId: string): Promise<{
    id: string;
    status: string;
    amountMinor: number;
    metadata: Record<string, string>;
  }>;
  constructWebhookEvent(payload: string | Buffer, signature: string): VerifiedWebhookEvent;
}
