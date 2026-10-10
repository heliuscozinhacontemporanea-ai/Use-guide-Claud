import { stripePaymentService } from '../factory';
import type {
  CreatePaymentIntentResult,
  RefundPaymentResult,
  VerifiedWebhookEvent,
} from '../ports/paymentGatewayPort';
import type { WebhookEventClaimResult } from '../ports/transactionRepositoryPort';

export async function createPaymentForTicketOrderUseCase(params: {
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
  return stripePaymentService.createTicketOrderPaymentIntent(params);
}

export async function createPlanPaymentIntentUseCase(params: {
  buyerId: string;
  planId: string;
  planName: string;
  amountMinor: number;
  idempotencyKey: string;
}): Promise<CreatePaymentIntentResult & { transactionId: string }> {
  return stripePaymentService.createPlanPaymentIntent(params);
}

export async function processProviderRefundUseCase(params: {
  paymentIntentId: string;
  amountMinor?: number;
  reverseTransfer?: boolean;
  refundApplicationFee?: boolean;
  idempotencyKey: string;
  metadata?: Record<string, string>;
}): Promise<RefundPaymentResult> {
  return stripePaymentService.refundPayment(params);
}

export async function retrievePaymentIntentUseCase(paymentIntentId: string) {
  return stripePaymentService.retrievePaymentIntent(paymentIntentId);
}

export function constructStripeWebhookEventUseCase(
  payload: string | Buffer,
  signature: string
): VerifiedWebhookEvent {
  return stripePaymentService.constructWebhookEvent(payload, signature);
}

export async function claimStripeWebhookEventUseCase(params: {
  eventId: string;
  eventType: string;
}): Promise<WebhookEventClaimResult> {
  return stripePaymentService.claimWebhookEvent(params);
}

export async function completeStripeWebhookEventUseCase(eventId: string): Promise<void> {
  return stripePaymentService.completeWebhookEvent(eventId);
}

export async function releaseStripeWebhookEventUseCase(
  eventId: string,
  errorMessage: string
): Promise<void> {
  return stripePaymentService.releaseWebhookEvent(eventId, errorMessage);
}

export async function updatePaymentTransactionStatusUseCase(
  paymentIntentId: string,
  status: string,
  statusDetail?: string
): Promise<boolean> {
  return stripePaymentService.updateTransactionStatus(
    paymentIntentId,
    status,
    statusDetail
  );
}
