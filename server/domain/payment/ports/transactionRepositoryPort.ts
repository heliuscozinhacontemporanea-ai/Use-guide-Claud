import type { StripeConnectedAccountRecord } from './marketplaceAccountPort';
import type { PaymentStatus, PaymentTransaction } from './paymentGatewayPort';

export interface TransactionRecord {
  id: string;
  userId: string | null;
  referenceType?: 'ticket_order' | 'plan_payment';
  referenceId?: string | null;
  providerPaymentId?: string | null;
  connectedAccountId?: string | null;
  amount: number | null;
  amountMinor?: number | null;
  platformFeeMinor?: number | null;
  paymentMethod: string | null;
  status: string | null;
  createdAt: unknown;
  updatedAt: unknown;
  paymentDetail?: Record<string, unknown>;
}

export interface TransactionRepositoryPort {
  updateTransactionStatus(
    transactionId: string,
    status: string,
    statusDetail?: string
  ): Promise<boolean>;
  getTransaction(transactionId: string): Promise<TransactionRecord | null>;
  getTransactionByIdempotencyKey(
    idempotencyKey: string
  ): Promise<TransactionRecord | null>;
  saveTransactionRecord(record: {
    transactionId: string;
    idempotencyKey: string;
    userId: string;
    referenceType: 'ticket_order' | 'plan_payment';
    referenceId: string;
    providerPaymentId: string;
    connectedAccountId?: string;
    amountMinor: number;
    platformFeeMinor: number;
    paymentMethod: string;
    status: PaymentStatus | string;
    paymentResult?: Record<string, unknown>;
  }): Promise<PaymentTransaction>;
  getConnectedAccountRecord(
    partnerId: string
  ): Promise<StripeConnectedAccountRecord | null>;
  getConnectedAccountRecordByStripeAccountId(
    stripeAccountId: string
  ): Promise<StripeConnectedAccountRecord | null>;
  saveConnectedAccountRecord(
    record: StripeConnectedAccountRecord
  ): Promise<void>;
  markWebhookEventProcessed(params: {
    eventId: string;
    eventType: string;
  }): Promise<boolean>;
}
