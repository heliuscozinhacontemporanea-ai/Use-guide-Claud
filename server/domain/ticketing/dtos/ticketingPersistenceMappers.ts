import type { TermsAcceptance } from '../../../shared/kernel/legalTerms';
import { isCancellationPolicyAllowed } from '../../../shared/kernel/cancellationPolicy';
import type {
  EventCheckIn,
  EventPromoCode,
  EventWaitlistEntry,
  InventoryReservation,
  OfflineCheckInSession,
  Refund,
  Ticket,
  TicketOrder,
  TicketOrderItem,
  TicketOrderSalesPolicySnapshot,
  TicketTransfer,
  TicketType,
} from '../types/ticketingTypes';

function toIso(val: unknown, fallback: string): string {
  if (typeof val === 'string' && val.trim().length > 0) return val;
  if (
    val &&
    typeof val === 'object' &&
    'toDate' in val &&
    typeof (val as { toDate: () => Date }).toDate === 'function'
  ) {
    return (val as { toDate: () => Date }).toDate().toISOString();
  }
  return fallback;
}

/** Pedido gravado antes de uma regra existir não tem compatibilidade (§2.2.8): campo inválido vira o padrão. */
function normalizeSalesPolicySnapshot(
  raw: Record<string, unknown>
): TicketOrderSalesPolicySnapshot {
  return {
    cancellationPolicy:
      typeof raw.cancellationPolicy === 'string' &&
      isCancellationPolicyAllowed('event', raw.cancellationPolicy)
        ? (raw.cancellationPolicy as TicketOrderSalesPolicySnapshot['cancellationPolicy'])
        : 'flexible',
    serviceFeeMode: raw.serviceFeeMode === 'absorb' ? 'absorb' : 'pass_to_buyer',
    allowTicketTransfer:
      typeof raw.allowTicketTransfer === 'boolean' ? raw.allowTicketTransfer : true,
    ticketTransferCutoffHours:
      typeof raw.ticketTransferCutoffHours === 'number' ? raw.ticketTransferCutoffHours : 4,
  };
}

function toTermsAcceptance(raw: unknown): { termsAcceptance?: TermsAcceptance } {
  const value = raw as Record<string, unknown> | undefined;
  if (typeof value?.version !== 'string' || typeof value.acceptedAt !== 'string') return {};
  return { termsAcceptance: { version: value.version, acceptedAt: value.acceptedAt } };
}

export class TicketTypePersistenceMapper {
  static toDomain(id: string, raw: Record<string, unknown>): TicketType {
    const now = new Date().toISOString();
    return {
      id,
      occurrenceId: String(raw.occurrenceId || ''),
      eventListingId: typeof raw.eventListingId === 'string' ? raw.eventListingId : undefined,
      name: String(raw.name || ''),
      description: typeof raw.description === 'string' ? raw.description : undefined,
      kind:
        raw.kind === 'free' || raw.kind === 'courtesy' || raw.kind === 'half_entry'
          ? raw.kind
          : 'paid',
      priceMinor: typeof raw.priceMinor === 'number' ? Math.trunc(raw.priceMinor) : 0,
      currency: 'BRL',
      quantity: typeof raw.quantity === 'number' ? Math.trunc(raw.quantity) : 0,
      soldCount: typeof raw.soldCount === 'number' ? Math.trunc(raw.soldCount) : 0,
      reservedCount: typeof raw.reservedCount === 'number' ? Math.trunc(raw.reservedCount) : 0,
      minPerOrder: typeof raw.minPerOrder === 'number' ? Math.trunc(raw.minPerOrder) : 1,
      maxPerOrder: typeof raw.maxPerOrder === 'number' ? Math.trunc(raw.maxPerOrder) : 10,
      salesStartsAt: typeof raw.salesStartsAt === 'string' ? raw.salesStartsAt : undefined,
      salesEndsAt: typeof raw.salesEndsAt === 'string' ? raw.salesEndsAt : undefined,
      status:
        raw.status === 'draft' ||
        raw.status === 'paused' ||
        raw.status === 'sold_out' ||
        raw.status === 'ended' ||
        raw.status === 'archived'
          ? raw.status
          : 'on_sale',
      visibility:
        raw.visibility === 'hidden' || raw.visibility === 'restricted' ? raw.visibility : 'public',
      requiresEligibilityProof:
        typeof raw.requiresEligibilityProof === 'boolean'
          ? raw.requiresEligibilityProof
          : undefined,
      sortOrder: typeof raw.sortOrder === 'number' ? Math.trunc(raw.sortOrder) : 0,
      createdAt: toIso(raw.createdAt, now),
      updatedAt: toIso(raw.updatedAt, now),
    };
  }
}

export class TicketOrderPersistenceMapper {
  static toDomain(id: string, raw: Record<string, unknown>): TicketOrder {
    const now = new Date().toISOString();
    const rawBuyer = (raw.buyerSnapshot as Record<string, unknown> | undefined) || {};
    const rawPolicy = (raw.salesPolicySnapshot as Record<string, unknown> | undefined) || {};
    const rawEvent = raw.eventSnapshot as Record<string, unknown> | undefined;

    return {
      id,
      buyerId: String(raw.buyerId || ''),
      eventListingId: String(raw.eventListingId || ''),
      occurrenceId: String(raw.occurrenceId || ''),
      status:
        raw.status === 'payment_processing' ||
        raw.status === 'paid' ||
        raw.status === 'payment_failed' ||
        raw.status === 'expired' ||
        raw.status === 'partially_refunded' ||
        raw.status === 'refunded' ||
        raw.status === 'canceled' ||
        raw.status === 'chargeback'
          ? raw.status
          : 'pending_payment',
      currency: 'BRL',
      subtotalMinor: typeof raw.subtotalMinor === 'number' ? Math.trunc(raw.subtotalMinor) : 0,
      discountMinor: typeof raw.discountMinor === 'number' ? Math.trunc(raw.discountMinor) : 0,
      platformFeeMinor:
        typeof raw.platformFeeMinor === 'number' ? Math.trunc(raw.platformFeeMinor) : 0,
      paymentFeeMinor:
        typeof raw.paymentFeeMinor === 'number' ? Math.trunc(raw.paymentFeeMinor) : 0,
      serviceFeeMinor:
        typeof raw.serviceFeeMinor === 'number' ? Math.trunc(raw.serviceFeeMinor) : 0,
      totalMinor: typeof raw.totalMinor === 'number' ? Math.trunc(raw.totalMinor) : 0,
      paymentId: typeof raw.paymentId === 'string' ? raw.paymentId : undefined,
      paymentIntentId: typeof raw.paymentIntentId === 'string' ? raw.paymentIntentId : undefined,
      promoCodeId: typeof raw.promoCodeId === 'string' ? raw.promoCodeId : undefined,
      promoterCode: typeof raw.promoterCode === 'string' ? raw.promoterCode : undefined,
      buyerSnapshot: {
        name: String(rawBuyer.name || ''),
        email: String(rawBuyer.email || ''),
      },
      eventSnapshot: rawEvent
        ? {
            title: String(rawEvent.title || ''),
            startsAt: String(rawEvent.startsAt || ''),
            endsAt: String(rawEvent.endsAt || ''),
            locationName:
              typeof rawEvent.locationName === 'string' ? rawEvent.locationName : undefined,
          }
        : undefined,
      salesPolicySnapshot: normalizeSalesPolicySnapshot(rawPolicy),
      ...toTermsAcceptance(raw.termsAcceptance),
      idempotencyKey: String(raw.idempotencyKey || ''),
      expiresAt: typeof raw.expiresAt === 'string' ? raw.expiresAt : undefined,
      createdAt: toIso(raw.createdAt, now),
      paidAt: typeof raw.paidAt === 'string' ? raw.paidAt : undefined,
      rescheduledAt: typeof raw.rescheduledAt === 'string' ? raw.rescheduledAt : undefined,
      canceledAt: typeof raw.canceledAt === 'string' ? raw.canceledAt : undefined,
      expiredAt: typeof raw.expiredAt === 'string' ? raw.expiredAt : undefined,
      updatedAt: toIso(raw.updatedAt, now),
    };
  }
}

export class TicketOrderItemPersistenceMapper {
  static toDomain(id: string, raw: Record<string, unknown>): TicketOrderItem {
    const snap = (raw.ticketTypeSnapshot as Record<string, unknown> | undefined) || {};
    return {
      id,
      orderId: String(raw.orderId || ''),
      ticketTypeId: String(raw.ticketTypeId || ''),
      quantity: typeof raw.quantity === 'number' ? Math.trunc(raw.quantity) : 1,
      unitPriceMinor: typeof raw.unitPriceMinor === 'number' ? Math.trunc(raw.unitPriceMinor) : 0,
      discountMinor: typeof raw.discountMinor === 'number' ? Math.trunc(raw.discountMinor) : 0,
      allocatedPlatformFeeMinor:
        typeof raw.allocatedPlatformFeeMinor === 'number'
          ? Math.trunc(raw.allocatedPlatformFeeMinor)
          : 0,
      allocatedPaymentFeeMinor:
        typeof raw.allocatedPaymentFeeMinor === 'number'
          ? Math.trunc(raw.allocatedPaymentFeeMinor)
          : 0,
      allocatedServiceFeeMinor:
        typeof raw.allocatedServiceFeeMinor === 'number'
          ? Math.trunc(raw.allocatedServiceFeeMinor)
          : 0,
      totalMinor: typeof raw.totalMinor === 'number' ? Math.trunc(raw.totalMinor) : 0,
      ticketTypeSnapshot: {
        name: String(snap.name || ''),
        kind:
          snap.kind === 'free' || snap.kind === 'courtesy' || snap.kind === 'half_entry'
            ? snap.kind
            : 'paid',
      },
    };
  }
}

export class TicketPersistenceMapper {
  static toDomain(id: string, raw: Record<string, unknown>): Ticket {
    const now = new Date().toISOString();
    const rawTypeSnap = raw.ticketTypeSnapshot as Record<string, unknown> | undefined;
    const rawEventSnap = raw.eventSnapshot as Record<string, unknown> | undefined;
    return {
      id,
      orderId: String(raw.orderId || ''),
      eventListingId: String(raw.eventListingId || ''),
      occurrenceId: String(raw.occurrenceId || ''),
      ticketTypeId: String(raw.ticketTypeId || ''),
      ownerUserId: String(raw.ownerUserId || ''),
      holderName: String(raw.holderName || ''),
      holderEmail: String(raw.holderEmail || ''),
      qrTokenHash: String(raw.qrTokenHash || ''),
      qrVersion:
        typeof raw.qrVersion === 'number' && raw.qrVersion >= 1 ? Math.trunc(raw.qrVersion) : 1,
      ...(typeof raw.qrSwappedAt === 'string' ? { qrSwappedAt: raw.qrSwappedAt } : {}),
      ...(typeof raw.updatedAt === 'string' ? { updatedAt: raw.updatedAt } : {}),
      status:
        raw.status === 'reserved' ||
        raw.status === 'checked_in' ||
        raw.status === 'transferred' ||
        raw.status === 'refund_pending' ||
        raw.status === 'refunded' ||
        raw.status === 'canceled' ||
        raw.status === 'void' ||
        raw.status === 'expired'
          ? raw.status
          : 'issued',
      issuedAt: toIso(raw.issuedAt, now),
      checkedInAt: typeof raw.checkedInAt === 'string' ? raw.checkedInAt : undefined,
      checkedInBy: typeof raw.checkedInBy === 'string' ? raw.checkedInBy : undefined,
      transferredAt: typeof raw.transferredAt === 'string' ? raw.transferredAt : undefined,
      ticketTypeSnapshot: rawTypeSnap
        ? {
            name: String(rawTypeSnap.name || ''),
            kind:
              rawTypeSnap.kind === 'free' ||
              rawTypeSnap.kind === 'courtesy' ||
              rawTypeSnap.kind === 'half_entry'
                ? rawTypeSnap.kind
                : 'paid',
            unitPriceMinor:
              typeof rawTypeSnap.unitPriceMinor === 'number'
                ? Math.trunc(rawTypeSnap.unitPriceMinor)
                : 0,
            ...(typeof rawTypeSnap.effectivePaidMinor === 'number'
              ? {
                  effectivePaidMinor: Math.trunc(rawTypeSnap.effectivePaidMinor),
                }
              : {}),
          }
        : undefined,
      eventSnapshot: rawEventSnap
        ? {
            title: String(rawEventSnap.title || ''),
            startsAt: String(rawEventSnap.startsAt || ''),
            endsAt: String(rawEventSnap.endsAt || ''),
            locationName:
              typeof rawEventSnap.locationName === 'string' ? rawEventSnap.locationName : undefined,
          }
        : undefined,
    };
  }
}

export class RefundPersistenceMapper {
  static toDomain(id: string, raw: Record<string, unknown>): Refund {
    const now = new Date().toISOString();
    return {
      id,
      orderId: String(raw.orderId || ''),
      ticketId: typeof raw.ticketId === 'string' ? raw.ticketId : undefined,
      amountMinor: typeof raw.amountMinor === 'number' ? Math.trunc(raw.amountMinor) : 0,
      serviceFeeMinor:
        typeof raw.serviceFeeMinor === 'number' ? Math.trunc(raw.serviceFeeMinor) : 0,
      requestedBy:
        raw.requestedBy === 'partner' || raw.requestedBy === 'admin' || raw.requestedBy === 'system'
          ? raw.requestedBy
          : 'buyer',
      reason: String(raw.reason || ''),
      status:
        raw.status === 'pending_provider' ||
        raw.status === 'approved' ||
        raw.status === 'failed' ||
        raw.status === 'rejected'
          ? raw.status
          : 'requested',
      provider: 'stripe',
      providerRefundId: typeof raw.providerRefundId === 'string' ? raw.providerRefundId : null,
      idempotencyKey: String(raw.idempotencyKey || ''),
      createdAt: toIso(raw.createdAt, now),
      completedAt: typeof raw.completedAt === 'string' ? raw.completedAt : undefined,
    };
  }
}

export class InventoryReservationPersistenceMapper {
  static toDomain(id: string, raw: Record<string, unknown>): InventoryReservation {
    const now = new Date().toISOString();
    return {
      id,
      occurrenceId: String(raw.occurrenceId || ''),
      ticketTypeId: String(raw.ticketTypeId || ''),
      orderId: String(raw.orderId || ''),
      quantity: typeof raw.quantity === 'number' ? Math.trunc(raw.quantity) : 1,
      status:
        raw.status === 'consumed' || raw.status === 'released' || raw.status === 'expired'
          ? raw.status
          : 'active',
      expiresAt: toIso(raw.expiresAt, now),
      createdAt: toIso(raw.createdAt, now),
      releasedAt: typeof raw.releasedAt === 'string' ? raw.releasedAt : undefined,
    };
  }
}

export class TicketTransferPersistenceMapper {
  static toDomain(id: string, raw: Record<string, unknown>): TicketTransfer {
    const now = new Date().toISOString();
    return {
      id,
      ticketId: String(raw.ticketId || ''),
      fromUserId: String(raw.fromUserId || ''),
      toUserId: typeof raw.toUserId === 'string' ? raw.toUserId : undefined,
      recipientEmail: String(raw.recipientEmail || ''),
      recipientName: typeof raw.recipientName === 'string' ? raw.recipientName : undefined,
      status:
        raw.status === 'accepted' ||
        raw.status === 'rejected' ||
        raw.status === 'expired' ||
        raw.status === 'completed'
          ? raw.status
          : 'pending',
      expiresAt: toIso(raw.expiresAt, now),
      createdAt: toIso(raw.createdAt, now),
      completedAt: typeof raw.completedAt === 'string' ? raw.completedAt : undefined,
    };
  }
}

export class EventWaitlistPersistenceMapper {
  static toDomain(id: string, raw: Record<string, unknown>): EventWaitlistEntry {
    const now = new Date().toISOString();
    return {
      id,
      occurrenceId: String(raw.occurrenceId || ''),
      userId: String(raw.userId || ''),
      ticketTypeId: typeof raw.ticketTypeId === 'string' ? raw.ticketTypeId : undefined,
      quantity: typeof raw.quantity === 'number' ? Math.trunc(raw.quantity) : 1,
      status:
        raw.status === 'offered' ||
        raw.status === 'accepted' ||
        raw.status === 'expired' ||
        raw.status === 'canceled'
          ? raw.status
          : 'waiting',
      offeredUntil: typeof raw.offeredUntil === 'string' ? raw.offeredUntil : undefined,
      createdAt: toIso(raw.createdAt, now),
    };
  }
}

export class EventCheckInPersistenceMapper {
  static toDomain(id: string, raw: Record<string, unknown>): EventCheckIn {
    const now = new Date().toISOString();
    return {
      id,
      ticketId: String(raw.ticketId || ''),
      occurrenceId: String(raw.occurrenceId || ''),
      checkedInBy: String(raw.checkedInBy || ''),
      source: raw.source === 'offline' ? 'offline' : 'online',
      offlineSessionId: typeof raw.offlineSessionId === 'string' ? raw.offlineSessionId : undefined,
      stationId: typeof raw.stationId === 'string' ? raw.stationId : undefined,
      clientEventId: typeof raw.clientEventId === 'string' ? raw.clientEventId : undefined,
      checkedInAt: toIso(raw.checkedInAt, now),
      syncedAt: typeof raw.syncedAt === 'string' ? raw.syncedAt : undefined,
    };
  }
}

export class OfflineCheckInSessionPersistenceMapper {
  static toDomain(id: string, raw: Record<string, unknown>): OfflineCheckInSession {
    const now = new Date().toISOString();
    return {
      id,
      partnerId: String(raw.partnerId || ''),
      occurrenceId: String(raw.occurrenceId || ''),
      eventListingId: String(raw.eventListingId || ''),
      stationId: String(raw.stationId || 'default'),
      issuedAt: toIso(raw.issuedAt, now),
      expiresAt: toIso(raw.expiresAt, now),
      manifestHash: String(raw.manifestHash || ''),
      status: raw.status === 'expired' || raw.status === 'revoked' ? raw.status : 'active',
      keyId: String(raw.keyId || 'use-guide-rsa-pss-v1'),
    };
  }
}

export class EventPromoCodePersistenceMapper {
  static toDomain(id: string, raw: Record<string, unknown>): EventPromoCode {
    const now = new Date().toISOString();
    return {
      id,
      eventListingId: String(raw.eventListingId || ''),
      code: String(raw.code || '').toUpperCase(),
      type: raw.type === 'fixed' ? 'fixed' : 'percentage',
      valueMinor: typeof raw.valueMinor === 'number' ? Math.trunc(raw.valueMinor) : undefined,
      percentage: typeof raw.percentage === 'number' ? Math.trunc(raw.percentage) : undefined,
      maxUses: typeof raw.maxUses === 'number' ? Math.trunc(raw.maxUses) : undefined,
      usedCount: typeof raw.usedCount === 'number' ? Math.trunc(raw.usedCount) : 0,
      startsAt: typeof raw.startsAt === 'string' ? raw.startsAt : undefined,
      endsAt: typeof raw.endsAt === 'string' ? raw.endsAt : undefined,
      ticketTypeIds: Array.isArray(raw.ticketTypeIds)
        ? raw.ticketTypeIds.filter((i): i is string => typeof i === 'string')
        : undefined,
      isActive: raw.isActive !== false,
      createdAt: toIso(raw.createdAt, now),
      updatedAt: toIso(raw.updatedAt, now),
    };
  }
}
