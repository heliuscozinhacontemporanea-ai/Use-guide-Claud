import type { EventCancellationPolicy } from '../../../shared/kernel/cancellationPolicy';
import type { TermsAcceptance } from '../../../shared/kernel/legalTerms';
import type { ServiceFeeMode } from '../../../shared/kernel/platformFees';
export type MoneyMinor = number;

export const CHECKOUT_RESERVATION_MINUTES = 10;

export function assertMoneyMinor(value: number): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error('Valor monetário inválido.');
  }
}

export type TicketTypeKind = 'paid' | 'free' | 'courtesy' | 'half_entry';

export type TicketTypeStatus = 'draft' | 'on_sale' | 'paused' | 'sold_out' | 'ended' | 'archived';

export interface TicketType {
  id: string;
  occurrenceId: string;
  eventListingId?: string;
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

export type PublicTicketSaleStatus = 'not_started' | 'on_sale' | 'closed' | 'sold_out';

export interface PublicTicketTypeProjection {
  id: string;
  occurrenceId: string;
  name: string;
  description?: string;
  kind: 'paid' | 'free';
  priceMinor: MoneyMinor;
  currency: 'BRL';
  availableQuantity: number;
  minPerOrder: number;
  maxPerOrder: number;
  salesStartsAt?: string;
  salesEndsAt?: string;
  requiresEligibilityProof?: boolean;
  sortOrder: number;
  status: 'not_started' | 'on_sale' | 'sold_out' | 'ended';
  saleStatus: PublicTicketSaleStatus;
}

export interface InventoryReservation {
  id: string;
  occurrenceId: string;
  ticketTypeId: string;
  orderId: string;
  quantity: number;
  status: 'active' | 'consumed' | 'released' | 'expired';
  expiresAt: string;
  createdAt: string;
  releasedAt?: string;
}

export type TicketOrderStatus =
  | 'pending_payment'
  | 'payment_processing'
  | 'paid'
  | 'payment_failed'
  | 'expired'
  | 'partially_refunded'
  | 'refunded'
  | 'canceled'
  | 'chargeback';

/** Regras de venda do evento gravadas na compra (D14): é o que vale para este pedido. */
export interface TicketOrderSalesPolicySnapshot {
  cancellationPolicy: EventCancellationPolicy;
  serviceFeeMode: ServiceFeeMode;
  allowTicketTransfer: boolean;
  ticketTransferCutoffHours: number;
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
  /** Taxa de serviço paga pelo comprador (D14); soma no total e fica com a plataforma. */
  serviceFeeMinor: MoneyMinor;
  totalMinor: MoneyMinor;
  paymentId?: string;
  paymentIntentId?: string;
  promoCodeId?: string;
  promoterCode?: string;
  buyerSnapshot: {
    name: string;
    email: string;
  };
  eventSnapshot?: {
    title: string;
    startsAt: string;
    endsAt: string;
    locationName?: string;
  };
  salesPolicySnapshot: TicketOrderSalesPolicySnapshot;
  /** Versão dos termos aceita na compra (D15). */
  termsAcceptance?: TermsAcceptance;
  idempotencyKey: string;
  expiresAt?: string;
  createdAt: string;
  paidAt?: string;
  canceledAt?: string;
  expiredAt?: string;
  updatedAt?: string;
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
  allocatedServiceFeeMinor: MoneyMinor;
  totalMinor: MoneyMinor;
  ticketTypeSnapshot: {
    name: string;
    kind: TicketTypeKind;
  };
}

export type TicketStatus =
  | 'reserved'
  | 'issued'
  | 'checked_in'
  | 'transferred'
  | 'refund_pending'
  | 'refunded'
  | 'canceled'
  | 'void'
  | 'expired';

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
  issuedAt: string;
  checkedInAt?: string;
  checkedInBy?: string;
  transferredAt?: string;
  ticketTypeSnapshot?: {
    name: string;
    kind: TicketTypeKind;
    unitPriceMinor: MoneyMinor;
    effectivePaidMinor?: MoneyMinor;
  };
  eventSnapshot?: {
    title: string;
    startsAt: string;
    endsAt: string;
    locationName?: string;
  };
}

export type RefundStatus = 'requested' | 'pending_provider' | 'approved' | 'failed' | 'rejected';

export interface Refund {
  id: string;
  orderId: string;
  ticketId?: string;
  amountMinor: MoneyMinor;
  requestedBy: 'buyer' | 'partner' | 'admin' | 'system';
  reason: string;
  status: RefundStatus;
  provider: 'stripe';
  providerRefundId?: string | null;
  idempotencyKey: string;
  createdAt: string;
  completedAt?: string;
}

export interface TicketTransfer {
  id: string;
  ticketId: string;
  fromUserId: string;
  toUserId?: string;
  recipientEmail: string;
  recipientName?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'completed';
  expiresAt: string;
  createdAt: string;
  completedAt?: string;
}

export interface EventWaitlistEntry {
  id: string;
  occurrenceId: string;
  userId: string;
  ticketTypeId?: string;
  quantity: number;
  status: 'waiting' | 'offered' | 'accepted' | 'expired' | 'canceled';
  offeredUntil?: string;
  createdAt: string;
}

export interface EventCheckIn {
  id: string;
  ticketId: string;
  occurrenceId: string;
  checkedInBy: string;
  source: 'online' | 'offline';
  offlineSessionId?: string;
  stationId?: string;
  clientEventId?: string;
  checkedInAt: string;
  syncedAt?: string;
}

export interface OfflineCheckInSession {
  id: string;
  partnerId: string;
  occurrenceId: string;
  eventListingId: string;
  stationId: string;
  issuedAt: string;
  expiresAt: string;
  manifestHash: string;
  status: 'active' | 'expired' | 'revoked';
  keyId: string;
}

export interface OfflineCheckInManifest {
  version: 1;
  sessionId: string;
  occurrenceId: string;
  eventListingId: string;
  stationId: string;
  issuedAt: string;
  expiresAt: string;
  keyId: string;
  publicKeyJwk: JsonWebKey;
  tickets: Array<{
    ticketIdHash: string;
    qrVersion: number;
  }>;
}

export interface OfflineCheckInEvent {
  clientEventId: string;
  sessionId: string;
  ticketId: string;
  ticketIdHash: string;
  occurrenceId: string;
  qrVersion: number;
  scannedAt: string;
}

export interface OfflineCheckInSyncResultItem {
  clientEventId: string;
  status: 'accepted' | 'already_checked_in' | 'invalid' | 'expired' | 'wrong_occurrence';
}

export interface EventPromoCode {
  id: string;
  eventListingId: string;
  code: string;
  type: 'percentage' | 'fixed';
  valueMinor?: MoneyMinor;
  percentage?: number;
  maxUses?: number;
  usedCount: number;
  startsAt?: string;
  endsAt?: string;
  ticketTypeIds?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformFeePolicy {
  type: 'percentage' | 'fixed';
  value: number;
}

export interface TicketingFeePolicy {
  type: 'fixed' | 'percentage';
  value: number;
  payer: 'buyer' | 'partner' | 'platform';
}

export interface EventSalesAnalytics {
  grossSalesMinor: MoneyMinor;
  discountsMinor: MoneyMinor;
  platformFeesMinor: MoneyMinor;
  paymentFeesMinor: MoneyMinor;
  refundsMinor: MoneyMinor;
  netSalesMinor: MoneyMinor;
  ticketsIssued: number;
  ticketsCheckedIn: number;
  ticketsRefunded: number;
  checkInRate: number;
  byTicketType: Array<{
    ticketTypeId: string;
    name?: string;
    sold: number;
    grossMinor: MoneyMinor;
  }>;
}

export interface VerifiedAttendanceForReview {
  eligible: boolean;
  reason?: string;
  ticketId: string;
  occurrenceId: string;
  eventListingId: string;
  ownerUserId: string;
  eventOwnerId: string;
  eventPartnerId?: string;
  eventTitle: string;
}

export function canTransitionOrderStatus(from: TicketOrderStatus, to: TicketOrderStatus): boolean {
  if (from === to) return true;
  const allowed: Record<TicketOrderStatus, TicketOrderStatus[]> = {
    pending_payment: ['payment_processing', 'paid', 'payment_failed', 'expired', 'canceled'],
    payment_processing: ['paid', 'payment_failed', 'expired', 'canceled'],
    payment_failed: ['pending_payment', 'payment_processing', 'paid', 'expired', 'canceled'],
    paid: ['partially_refunded', 'refunded', 'chargeback', 'canceled'],
    partially_refunded: ['refunded', 'chargeback'],
    refunded: [],
    expired: [],
    canceled: [],
    chargeback: [],
  };
  return allowed[from]?.includes(to) ?? false;
}

export function canTransitionTicketStatus(from: TicketStatus, to: TicketStatus): boolean {
  if (from === to) return true;
  const allowed: Record<TicketStatus, TicketStatus[]> = {
    reserved: ['issued', 'canceled', 'expired', 'void'],
    issued: ['checked_in', 'transferred', 'refund_pending', 'refunded', 'canceled', 'void'],
    refund_pending: ['refunded', 'issued', 'canceled'],
    checked_in: ['void'],
    transferred: ['void'],
    refunded: [],
    canceled: [],
    void: [],
    expired: [],
  };
  return allowed[from]?.includes(to) ?? false;
}

export function deriveTicketTypeSaleStatus(params: {
  ticketType: TicketType;
  occurrenceCapacity: number;
  occurrenceCommittedCount: number;
  nowMs?: number;
}): {
  saleStatus: PublicTicketSaleStatus;
  status: 'not_started' | 'on_sale' | 'sold_out' | 'ended';
  availableQuantity: number;
} {
  const now = params.nowMs ?? Date.now();
  const { ticketType, occurrenceCapacity, occurrenceCommittedCount } = params;

  const ticketTypeRemaining = Math.max(
    0,
    ticketType.quantity - (ticketType.soldCount + ticketType.reservedCount)
  );
  const occurrenceRemaining = Math.max(0, occurrenceCapacity - occurrenceCommittedCount);
  const availableQuantity = Math.min(ticketTypeRemaining, occurrenceRemaining);

  if (
    ticketType.status === 'paused' ||
    ticketType.status === 'ended' ||
    ticketType.status === 'archived' ||
    ticketType.status === 'draft'
  ) {
    return {
      saleStatus: 'closed',
      status: 'ended',
      availableQuantity: 0,
    };
  }

  if (ticketType.salesStartsAt) {
    const startMs = new Date(ticketType.salesStartsAt).getTime();
    if (Number.isFinite(startMs) && now < startMs) {
      return {
        saleStatus: 'not_started',
        status: 'not_started',
        availableQuantity,
      };
    }
  }

  if (ticketType.salesEndsAt) {
    const endMs = new Date(ticketType.salesEndsAt).getTime();
    if (Number.isFinite(endMs) && now >= endMs) {
      return {
        saleStatus: 'closed',
        status: 'ended',
        availableQuantity: 0,
      };
    }
  }

  if (availableQuantity <= 0 || ticketType.status === 'sold_out') {
    return {
      saleStatus: 'sold_out',
      status: 'sold_out',
      availableQuantity: 0,
    };
  }

  return {
    saleStatus: 'on_sale',
    status: 'on_sale',
    availableQuantity,
  };
}
