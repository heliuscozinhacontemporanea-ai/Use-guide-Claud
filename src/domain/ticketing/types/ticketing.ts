export type MoneyMinor = number;

export type TicketTypeKind = 'paid' | 'free';

export type TicketTypeStatus =
  | 'draft'
  | 'scheduled'
  | 'on_sale'
  | 'paused'
  | 'sold_out'
  | 'ended'
  | 'archived';

export type PublicTicketSaleStatus = 'not_started' | 'on_sale' | 'sold_out' | 'ended';

export type TicketOrderStatus =
  | 'pending_payment'
  | 'payment_processing'
  | 'paid'
  | 'payment_failed'
  | 'expired'
  | 'canceled'
  | 'refund_pending'
  | 'partially_refunded'
  | 'refunded'
  | 'disputed';

export type TicketStatus =
  | 'reserved'
  | 'issued'
  | 'checked_in'
  | 'transferred'
  | 'refund_pending'
  | 'refunded'
  | 'canceled'
  | 'invalidated'
  | 'expired';

export type RefundStatus = 'requested' | 'processing' | 'succeeded' | 'failed';

export interface TicketType {
  id: string;
  occurrenceId: string;
  eventListingId: string;
  name: string;
  description?: string;
  kind: TicketTypeKind;
  priceMinor: MoneyMinor;
  currency: 'BRL';
  quantity: number;
  soldCount: number;
  reservedCount: number;
  minPerOrder: number;
  maxPerOrder: number;
  salesStartsAt?: string;
  salesEndsAt?: string;
  status: TicketTypeStatus;
  visibility: 'public' | 'hidden' | 'restricted';
  requiresEligibilityProof?: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface PublicTicketTypeProjection {
  id: string;
  occurrenceId: string;
  name: string;
  description?: string;
  kind: TicketTypeKind;
  priceMinor: MoneyMinor;
  currency: 'BRL';
  availableQuantity: number;
  minPerOrder: number;
  maxPerOrder: number;
  salesStartsAt?: string;
  salesEndsAt?: string;
  status: PublicTicketSaleStatus;
  requiresEligibilityProof?: boolean;
  sortOrder?: number;
}

export interface TicketOrderRefundPolicySnapshot {
  enabled: boolean;
  cancellationWindowHours?: number;
  allowBuyerCancellation: boolean;
  buyerCancellationWindowHours?: number;
  allowTicketTransfer: boolean;
  ticketTransferCutoffHours?: number;
}

export interface TicketOrder {
  id: string;
  buyerId: string;
  eventListingId: string;
  occurrenceId: string;
  status: TicketOrderStatus;
  currency: 'BRL';
  subtotalMinor: MoneyMinor;
  discountMinor: MoneyMinor;
  platformFeeMinor: MoneyMinor;
  paymentFeeMinor: MoneyMinor;
  totalMinor: MoneyMinor;
  paymentId?: string;
  paymentIntentId?: string;
  paymentChargeId?: string;
  paymentTransferId?: string;
  promoCodeId?: string;
  buyerSnapshot: {
    name: string;
    email: string;
    document?: string;
  };
  eventSnapshot?: {
    title: string;
    startsAt: string;
    endsAt: string;
    locationName?: string;
  };
  refundPolicySnapshot: TicketOrderRefundPolicySnapshot;
  expiresAt?: string;
  idempotencyKey: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketOrderItem {
  id: string;
  orderId: string;
  ticketTypeId: string;
  quantity: number;
  unitPriceMinor: MoneyMinor;
  discountMinor: MoneyMinor;
  allocatedPlatformFeeMinor: MoneyMinor;
  allocatedPaymentFeeMinor: MoneyMinor;
  totalMinor: MoneyMinor;
  ticketTypeSnapshot: {
    name: string;
    kind: TicketTypeKind;
    unitPriceMinor: MoneyMinor;
    salesStartsAt?: string;
    salesEndsAt?: string;
  };
}

export interface Ticket {
  id: string;
  orderId: string;
  eventListingId: string;
  occurrenceId: string;
  ticketTypeId: string;
  ownerUserId: string;
  holderName: string;
  holderEmail: string;
  qrTokenHash: string;
  qrVersion: number;
  status: TicketStatus;
  ticketTypeSnapshot?: {
    name: string;
    kind: TicketTypeKind;
    unitPriceMinor: MoneyMinor;
  };
  eventSnapshot?: {
    title: string;
    startsAt: string;
    endsAt: string;
    locationName?: string;
  };
  issuedAt: string;
  checkedInAt?: string;
  checkedInBy?: string;
  transferredFromTicketId?: string;
  transferredToTicketId?: string;
}

export interface EventCheckIn {
  id: string;
  ticketId: string;
  occurrenceId: string;
  eventListingId: string;
  checkedInBy: string;
  checkedInAt: string;
  method: 'qr' | 'manual' | 'offline_sync';
  source?: 'online' | 'offline';
  offlineSessionId?: string;
  stationId?: string;
  clientEventId?: string;
  syncedAt?: string;
}

export interface Refund {
  id: string;
  orderId: string;
  ticketId?: string;
  eventListingId: string;
  occurrenceId: string;
  amountMinor: MoneyMinor;
  reason: string;
  status: RefundStatus;
  requestedBy: string;
  providerRefundId?: string | null;
  idempotencyKey: string;
  createdAt: string;
  processedAt?: string;
}

export interface EventSalesAnalytics {
  eventListingId: string;
  occurrenceId?: string;
  grossSalesMinor: MoneyMinor;
  discountsMinor: MoneyMinor;
  platformFeesMinor: MoneyMinor;
  paymentFeesMinor: MoneyMinor;
  refundsMinor: MoneyMinor;
  netSalesMinor: MoneyMinor;
  ticketsSold: number;
  freeRegistrations: number;
  ticketsCheckedIn: number;
  ticketsRefunded: number;
  ordersPaid: number;
  ordersPending: number;
}

export interface PartnerMerchantStatus {
  connected: boolean;
  accountId?: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  status: 'pending' | 'restricted' | 'enabled' | 'disabled';
  /** Calculado no servidor: mesmo critério usado para vender. */
  readyForSales: boolean;
}

export interface OfflineCheckInSessionResponse {
  session: {
    id: string;
    partnerId: string;
    eventListingId: string;
    occurrenceId: string;
    stationId: string;
    issuedAt: string;
    expiresAt: string;
    manifestHash: string;
    status: 'active' | 'expired' | 'revoked';
    keyId: string;
  };
  publicKeyPem: string;
  manifest: Array<{
    ticketIdHash: string;
    qrVersion: number;
    status: 'issued' | 'checked_in';
  }>;
}

export interface OfflineCheckInSyncResult {
  clientEventId: string;
  ticketId: string;
  status: 'synced' | 'conflict_already_checked_in' | 'rejected_invalid_ticket';
  reason?: string;
}

export function formatMoneyMinorBrl(minor: MoneyMinor): string {
  if (minor <= 0) return 'Gratuito';
  return (minor / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}
