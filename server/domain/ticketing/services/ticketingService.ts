import crypto from 'crypto';
import {
  createEventAuditLogUseCase,
  getEventListingByIdUseCase,
  getEventOccurrenceByIdUseCase,
  updateEventListingPricingSummaryUseCase,
} from '../../events';
import { hashTicketIdForOfflineManifest } from '../adapters/rsaPssTicketQrTokenAdapter';
import {
  InventoryConflictError,
  OrderNotFoundError,
  RefundNotAllowedError,
  TicketNotEligibleForReviewError,
  TicketTypeUnavailableError,
  TicketingDomainError,
} from '../errors/ticketingDomainError';
import type { TicketQrTokenPort } from '../ports/ticketQrTokenPort';
import type { TicketingPort } from '../ports/ticketingPort';
import {
  assertMoneyMinor,
  canTransitionOrderStatus,
  CHECKOUT_RESERVATION_MINUTES,
  deriveTicketTypeSaleStatus,
  type EventCheckIn,
  type EventPromoCode,
  type EventSalesAnalytics,
  type EventWaitlistEntry,
  type OfflineCheckInEvent,
  type OfflineCheckInManifest,
  type OfflineCheckInSession,
  type OfflineCheckInSyncResultItem,
  type PublicTicketTypeProjection,
  type Refund,
  type Ticket,
  type TicketOrder,
  type TicketOrderItem,
  type TicketTransfer,
  type TicketType,
  type VerifiedAttendanceForReview,
} from '../types/ticketingTypes';
import { generateOpaqueTicketQrToken, listTicketQrTokenLookupHashes } from '../utils/qrToken';

export interface TicketingActorContext {
  uid: string;
  admin?: boolean;
  role?: string;
}

function isActorAdmin(actor: TicketingActorContext): boolean {
  return actor.admin === true;
}

function getAuditActorType(
  actor: TicketingActorContext,
  listingOwnerId?: string
): 'admin' | 'partner' | 'user' {
  if (isActorAdmin(actor)) return 'admin';
  if (listingOwnerId && actor.uid === listingOwnerId) return 'partner';
  return 'user';
}

export class TicketingService {
  constructor(
    private readonly port: TicketingPort,
    private readonly qrTokenPort?: TicketQrTokenPort
  ) {}

  private async assertCanManageOccurrence(
    actor: TicketingActorContext,
    occurrenceId: string
  ) {
    const occurrence = await getEventOccurrenceByIdUseCase(occurrenceId);
    if (!occurrence) {
      throw new TicketingDomainError(
        'NOT_FOUND',
        'Ocorrência do evento não encontrada.'
      );
    }
    const listing = await getEventListingByIdUseCase(occurrence.eventListingId);
    if (!listing) {
      throw new TicketingDomainError('NOT_FOUND', 'Evento não encontrado.');
    }
    if (!isActorAdmin(actor) && listing.ownerId !== actor.uid) {
      throw new TicketingDomainError(
        'FORBIDDEN',
        'Sem permissão para gerenciar os ingressos deste evento.'
      );
    }
    return { occurrence, listing };
  }

  private async refreshListingPricingSummary(
    eventListingId: string,
    occurrenceId: string
  ): Promise<void> {
    try {
      const types = await this.port.listTicketTypesByOccurrenceId(occurrenceId);
      const activeTypes = types.filter((t) => t.status !== 'archived');
      if (activeTypes.length === 0) return;

      const hasPaid = activeTypes.some((t) => t.priceMinor > 0);
      const paidPrices = activeTypes
        .filter((t) => t.priceMinor > 0)
        .map((t) => t.priceMinor);
      const startingPriceMinor =
        paidPrices.length > 0 ? Math.min(...paidPrices) : 0;

      await updateEventListingPricingSummaryUseCase(eventListingId, {
        pricingMode: hasPaid ? 'paid' : 'free',
        startingPriceMinor,
      });
    } catch {
      // Ignora erro não-bloqueante de sumário
    }
  }

  async createTicketType(
    actor: TicketingActorContext,
    input: {
      occurrenceId: string;
      name: string;
      description?: string;
      kind: TicketType['kind'];
      priceMinor: number;
      currency?: 'BRL';
      quantity: number;
      minPerOrder?: number;
      maxPerOrder?: number;
      salesStartsAt?: string;
      salesEndsAt?: string;
      status?: TicketType['status'];
      visibility?: TicketType['visibility'];
      requiresEligibilityProof?: boolean;
      sortOrder?: number;
    }
  ): Promise<TicketType> {
    assertMoneyMinor(input.priceMinor);
    const { occurrence, listing } = await this.assertCanManageOccurrence(
      actor,
      input.occurrenceId
    );

    if (input.quantity > occurrence.capacity) {
      throw new TicketingDomainError(
        'UNPROCESSABLE_ENTITY',
        `A quantidade do lote (${input.quantity}) não pode exceder a capacidade da ocorrência (${occurrence.capacity}).`
      );
    }

    const created = await this.port.createTicketType({
      occurrenceId: input.occurrenceId,
      eventListingId: listing.id,
      name: input.name.trim(),
      description: input.description?.trim(),
      kind: input.kind,
      priceMinor:
        input.kind === 'free' || input.kind === 'courtesy'
          ? 0
          : input.priceMinor,
      currency: 'BRL',
      quantity: input.quantity,
      minPerOrder: input.minPerOrder ?? 1,
      maxPerOrder: input.maxPerOrder ?? 10,
      salesStartsAt: input.salesStartsAt,
      salesEndsAt: input.salesEndsAt,
      status: input.status ?? 'on_sale',
      visibility: input.visibility ?? 'public',
      requiresEligibilityProof: input.requiresEligibilityProof,
      sortOrder: input.sortOrder ?? 0,
    });

    await this.refreshListingPricingSummary(listing.id, occurrence.id);

    await createEventAuditLogUseCase({
      actorId: actor.uid,
      actorType: getAuditActorType(actor, listing.ownerId),
      resourceType: 'ticketType',
      resourceId: created.id,
      action: 'ticket_type.created',
      after: {
        name: created.name,
        kind: created.kind,
        priceMinor: created.priceMinor,
        quantity: created.quantity,
      },
    });

    return created;
  }

  async updateTicketType(
    actor: TicketingActorContext,
    ticketTypeId: string,
    patch: Partial<
      Pick<
        TicketType,
        | 'name'
        | 'description'
        | 'priceMinor'
        | 'quantity'
        | 'minPerOrder'
        | 'maxPerOrder'
        | 'salesStartsAt'
        | 'salesEndsAt'
        | 'status'
        | 'visibility'
        | 'requiresEligibilityProof'
        | 'sortOrder'
      >
    >
  ): Promise<TicketType> {
    const existing = await this.port.getTicketTypeById(ticketTypeId);
    if (!existing) {
      throw new TicketingDomainError(
        'NOT_FOUND',
        'Lote de ingresso não encontrado.'
      );
    }

    const { occurrence, listing } = await this.assertCanManageOccurrence(
      actor,
      existing.occurrenceId
    );

    const committed = existing.soldCount + existing.reservedCount;
    if (patch.quantity !== undefined) {
      if (patch.quantity < committed) {
        throw new TicketingDomainError(
          'UNPROCESSABLE_ENTITY',
          `Não é permitido reduzir a quantidade do lote (${patch.quantity}) abaixo dos ingressos já vendidos/reservados (${committed}).`
        );
      }
      if (patch.quantity > occurrence.capacity) {
        throw new TicketingDomainError(
          'UNPROCESSABLE_ENTITY',
          `A quantidade do lote não pode ultrapassar a capacidade da sessão (${occurrence.capacity}).`
        );
      }
    }

    if (
      patch.priceMinor !== undefined &&
      patch.priceMinor !== existing.priceMinor &&
      existing.soldCount > 0
    ) {
      throw new TicketingDomainError(
        'UNPROCESSABLE_ENTITY',
        'Não é permitido alterar o preço de um lote que já possui vendas confirmadas. Crie um novo lote.'
      );
    }

    const updated = await this.port.updateTicketType(ticketTypeId, patch);
    await this.refreshListingPricingSummary(listing.id, occurrence.id);

    await createEventAuditLogUseCase({
      actorId: actor.uid,
      actorType: getAuditActorType(actor, listing.ownerId),
      resourceType: 'ticketType',
      resourceId: updated.id,
      action: 'ticket_type.updated',
      before: {
        priceMinor: existing.priceMinor,
        quantity: existing.quantity,
        status: existing.status,
      },
      after: {
        priceMinor: updated.priceMinor,
        quantity: updated.quantity,
        status: updated.status,
      },
    });

    return updated;
  }

  async archiveOrDeleteTicketType(
    actor: TicketingActorContext,
    ticketTypeId: string
  ): Promise<{ mode: 'deleted' | 'archived' }> {
    const existing = await this.port.getTicketTypeById(ticketTypeId);
    if (!existing) {
      throw new TicketingDomainError(
        'NOT_FOUND',
        'Lote de ingresso não encontrado.'
      );
    }
    const { occurrence, listing } = await this.assertCanManageOccurrence(
      actor,
      existing.occurrenceId
    );

    if (existing.soldCount > 0 || existing.reservedCount > 0) {
      await this.port.updateTicketType(ticketTypeId, { status: 'archived' });
      await this.refreshListingPricingSummary(listing.id, occurrence.id);
      return { mode: 'archived' };
    }

    await this.port.deleteTicketType(ticketTypeId);
    await this.refreshListingPricingSummary(listing.id, occurrence.id);
    return { mode: 'deleted' };
  }

  async listPublicTicketTypesByOccurrence(
    occurrenceId: string
  ): Promise<PublicTicketTypeProjection[]> {
    const occurrence = await getEventOccurrenceByIdUseCase(occurrenceId);
    if (!occurrence) {
      throw new TicketingDomainError(
        'NOT_FOUND',
        'Ocorrência do evento não encontrada.'
      );
    }
    const listing = await getEventListingByIdUseCase(occurrence.eventListingId);
    if (
      !listing ||
      listing.status !== 'published' ||
      listing.visibility === 'private'
    ) {
      throw new TicketingDomainError(
        'NOT_FOUND',
        'Evento indisponível para consulta pública.'
      );
    }

    const types = await this.port.listTicketTypesByOccurrenceId(occurrenceId);
    const totalCommitted = types.reduce(
      (sum, t) => sum + t.soldCount + t.reservedCount,
      0
    );

    return types
      .filter(
        (t) =>
          t.visibility === 'public' &&
          t.status !== 'archived' &&
          t.status !== 'draft'
      )
      .map((t) => {
        const { saleStatus, status, availableQuantity } =
          deriveTicketTypeSaleStatus({
            ticketType: t,
            occurrenceCapacity: occurrence.capacity,
            occurrenceCommittedCount: totalCommitted,
          });
        return {
          id: t.id,
          occurrenceId: t.occurrenceId,
          name: t.name,
          description: t.description,
          kind: t.priceMinor === 0 ? ('free' as const) : ('paid' as const),
          priceMinor: t.priceMinor,
          currency: 'BRL' as const,
          availableQuantity,
          minPerOrder: t.minPerOrder,
          maxPerOrder: t.maxPerOrder,
          salesStartsAt: t.salesStartsAt,
          salesEndsAt: t.salesEndsAt,
          requiresEligibilityProof: t.requiresEligibilityProof,
          sortOrder: t.sortOrder,
          status,
          saleStatus,
        };
      });
  }

  async listTicketTypesForManagement(
    actor: TicketingActorContext,
    occurrenceId: string
  ): Promise<TicketType[]> {
    await this.assertCanManageOccurrence(actor, occurrenceId);
    return this.port.listTicketTypesByOccurrenceId(occurrenceId);
  }

  async createTicketOrder(
    actor: TicketingActorContext,
    input: {
      occurrenceId: string;
      items: Array<{
        ticketTypeId: string;
        quantity: number;
        holders?: Array<{ name: string; email: string }>;
      }>;
      buyer: { name: string; email: string };
      promoCode?: string;
      promoterCode?: string;
      idempotencyKey: string;
    }
  ): Promise<{
    order: TicketOrder;
    items: TicketOrderItem[];
    issuedTickets: Array<{ ticket: Ticket; rawQrToken?: string }>;
    isIdempotentReplay: boolean;
    serverNow: string;
  }> {
    const occurrence = await getEventOccurrenceByIdUseCase(input.occurrenceId);
    if (!occurrence) {
      throw new TicketingDomainError(
        'NOT_FOUND',
        'Sessão do evento não encontrada.'
      );
    }
    if (occurrence.status !== 'scheduled') {
      throw new TicketTypeUnavailableError(
        'Esta sessão não está aberta para venda de ingressos.'
      );
    }

    const listing = await getEventListingByIdUseCase(occurrence.eventListingId);
    if (
      !listing ||
      listing.status !== 'published' ||
      listing.visibility === 'private'
    ) {
      throw new TicketTypeUnavailableError(
        'Este evento não está disponível para compras.'
      );
    }

    const nowMs = Date.now();
    if (
      occurrence.salesStartsAt &&
      nowMs < new Date(occurrence.salesStartsAt).getTime()
    ) {
      throw new TicketTypeUnavailableError(
        'As vendas para esta sessão ainda não iniciaram.'
      );
    }
    const effectiveEnd = occurrence.salesEndsAt || occurrence.startsAt;
    if (nowMs > new Date(effectiveEnd).getTime()) {
      throw new TicketTypeUnavailableError(
        'O período de vendas desta sessão já encerrou.'
      );
    }

    const maxPerUserPerOccurrence =
      listing.maxTicketsPerUserPerOccurrence ?? 5;
    const requestedTotalForOrder = input.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    const existingReplayOrder = await this.port.getOrderByIdempotencyKey(
      actor.uid,
      input.idempotencyKey
    );
    if (!existingReplayOrder) {
      const occurrenceTickets = await this.port.listTicketsByOccurrenceId(
        occurrence.id
      );
      const occurrenceOrders = await this.port.listOrdersByOccurrenceId(
        occurrence.id
      );

      const activeHolderTicketsCount = occurrenceTickets.filter(
        (t) =>
          t.ownerUserId === actor.uid &&
          (t.status === 'reserved' ||
            t.status === 'issued' ||
            t.status === 'checked_in')
      ).length;

      const activePendingOrders = occurrenceOrders.filter(
        (o) =>
          o.buyerId === actor.uid &&
          (o.status === 'pending_payment' ||
            o.status === 'payment_processing') &&
          (!o.expiresAt || new Date(o.expiresAt).getTime() > nowMs)
      );

      let activeReservedOrderTicketsCount = 0;
      for (const pendingOrder of activePendingOrders) {
        const orderItems = await this.port.listOrderItemsByOrderId(
          pendingOrder.id
        );
        activeReservedOrderTicketsCount += orderItems.reduce(
          (sum, oi) => sum + oi.quantity,
          0
        );
      }

      const existingCommittedForUser =
        activeHolderTicketsCount + activeReservedOrderTicketsCount;
      if (
        existingCommittedForUser + requestedTotalForOrder >
        maxPerUserPerOccurrence
      ) {
        throw new TicketingDomainError(
          'UNPROCESSABLE_ENTITY',
          `Limite máximo de ${maxPerUserPerOccurrence} ingressos por usuário nesta ocorrência excedido.`
        );
      }
    }

    const allTypes = await this.port.listTicketTypesByOccurrenceId(
      occurrence.id
    );
    const typeMap = new Map(allTypes.map((t) => [t.id, t]));
    const totalCommitted = allTypes.reduce(
      (sum, t) => sum + t.soldCount + t.reservedCount,
      0
    );

    let promo: EventPromoCode | null = null;
    if (input.promoCode) {
      promo = await this.port.getPromoCodeByCode(listing.id, input.promoCode);
      if (!promo || !promo.isActive) {
        throw new TicketingDomainError(
          'INVALID_ARGUMENT',
          'Cupom promocional inválido ou inativo.'
        );
      }
      if (promo.startsAt && nowMs < new Date(promo.startsAt).getTime()) {
        throw new TicketingDomainError(
          'UNPROCESSABLE_ENTITY',
          'Cupom promocional ainda não está vigente.'
        );
      }
      if (promo.endsAt && nowMs > new Date(promo.endsAt).getTime()) {
        throw new TicketingDomainError(
          'UNPROCESSABLE_ENTITY',
          'Cupom promocional expirado.'
        );
      }
      if (promo.maxUses !== undefined && promo.usedCount >= promo.maxUses) {
        throw new TicketingDomainError(
          'UNPROCESSABLE_ENTITY',
          'Limite de uso deste cupom atingido.'
        );
      }
    }

    let subtotalMinor = 0;
    let discountMinor = 0;

    const rawItemsPrepared: Array<{
      ticketType: TicketType;
      quantity: number;
      unitPriceMinor: number;
      lineSubtotal: number;
      lineDiscount: number;
      lineNetAfterDiscount: number;
      holders: Array<{
        name: string;
        email: string;
        qrTokenHash: string;
        rawQrToken: string;
      }>;
    }> = [];

    for (const reqItem of input.items) {
      const ticketType = typeMap.get(reqItem.ticketTypeId);
      if (!ticketType) {
        throw new TicketingDomainError(
          'NOT_FOUND',
          'Lote de ingresso não encontrado.'
        );
      }

      if (
        reqItem.quantity < ticketType.minPerOrder ||
        reqItem.quantity > ticketType.maxPerOrder
      ) {
        throw new TicketingDomainError(
          'UNPROCESSABLE_ENTITY',
          `A quantidade para "${ticketType.name}" deve estar entre ${ticketType.minPerOrder} e ${ticketType.maxPerOrder}.`
        );
      }

      const { saleStatus, availableQuantity } = deriveTicketTypeSaleStatus({
        ticketType,
        occurrenceCapacity: occurrence.capacity,
        occurrenceCommittedCount: totalCommitted,
        nowMs,
      });

      if (saleStatus !== 'on_sale') {
        if (saleStatus === 'sold_out') {
          throw new InventoryConflictError(
            `O lote "${ticketType.name}" está esgotado.`
          );
        }
        throw new TicketTypeUnavailableError(
          `O lote "${ticketType.name}" não está aberto para vendas.`
        );
      }

      if (reqItem.quantity > availableQuantity) {
        throw new InventoryConflictError(
          `Restam apenas ${availableQuantity} ingressos disponíveis para "${ticketType.name}".`
        );
      }

      const unitPriceMinor = ticketType.priceMinor;
      const lineSubtotal = unitPriceMinor * reqItem.quantity;
      let lineDiscount = 0;

      if (
        promo &&
        (!promo.ticketTypeIds || promo.ticketTypeIds.includes(ticketType.id))
      ) {
        if (promo.type === 'percentage' && promo.percentage) {
          lineDiscount = Math.floor((lineSubtotal * promo.percentage) / 100);
        } else if (promo.type === 'fixed' && promo.valueMinor) {
          lineDiscount = Math.min(lineSubtotal, promo.valueMinor);
        }
      }

      const lineNetAfterDiscount = Math.max(0, lineSubtotal - lineDiscount);
      subtotalMinor += lineSubtotal;
      discountMinor += lineDiscount;

      const holders: Array<{
        name: string;
        email: string;
        qrTokenHash: string;
        rawQrToken: string;
      }> = [];

      for (let idx = 0; idx < reqItem.quantity; idx += 1) {
        const customHolder = reqItem.holders?.[idx];
        const { rawQrToken, qrTokenHash } = generateOpaqueTicketQrToken();
        holders.push({
          name: customHolder?.name?.trim() || input.buyer.name.trim(),
          email: customHolder?.email?.trim() || input.buyer.email.trim(),
          qrTokenHash,
          rawQrToken,
        });
      }

      rawItemsPrepared.push({
        ticketType,
        quantity: reqItem.quantity,
        unitPriceMinor,
        lineSubtotal,
        lineDiscount,
        lineNetAfterDiscount,
        holders,
      });
    }

    const netSubtotalMinor = Math.max(0, subtotalMinor - discountMinor);
    const rawFee = process.env.USE_GUIDE_PLATFORM_FEE_PERCENT;
    const parsedFee = rawFee ? Number(String(rawFee).replace('%', '').trim()) : 10;
    const feePercent = Number.isFinite(parsedFee) ? parsedFee : 10;
    const platformFeeMinor =
      netSubtotalMinor > 0 && feePercent > 0
        ? Math.round((netSubtotalMinor * feePercent) / 100)
        : 0;
    const paymentFeeMinor = 0;
    const totalMinor = netSubtotalMinor;

    let remainingFeeToAllocate = platformFeeMinor;
    const preparedItems = rawItemsPrepared.map((item, idx) => {
      const isLast = idx === rawItemsPrepared.length - 1;
      const allocatedPlatformFeeMinor =
        netSubtotalMinor > 0
          ? isLast
            ? remainingFeeToAllocate
            : Math.floor(
                (platformFeeMinor * item.lineNetAfterDiscount) /
                  netSubtotalMinor
              )
          : 0;
      remainingFeeToAllocate = Math.max(
        0,
        remainingFeeToAllocate - allocatedPlatformFeeMinor
      );

      return {
        ticketTypeId: item.ticketType.id,
        quantity: item.quantity,
        unitPriceMinor: item.unitPriceMinor,
        discountMinor: item.lineDiscount,
        allocatedPlatformFeeMinor,
        allocatedPaymentFeeMinor: 0,
        totalMinor: item.lineNetAfterDiscount,
        ticketTypeSnapshot: {
          name: item.ticketType.name,
          kind: item.ticketType.kind,
        },
        holders: item.holders,
      };
    });

    const expiresAt = new Date(
      nowMs + CHECKOUT_RESERVATION_MINUTES * 60 * 1000
    ).toISOString();
    const issueImmediately = totalMinor === 0;

    const result = await this.port.reserveInventoryAndCreateOrderAtomic({
      occurrenceId: occurrence.id,
      occurrenceCapacity: occurrence.capacity,
      eventListingId: listing.id,
      buyerId: actor.uid,
      idempotencyKey: input.idempotencyKey,
      currency: 'BRL',
      subtotalMinor,
      discountMinor,
      platformFeeMinor,
      paymentFeeMinor,
      totalMinor,
      promoCodeId: promo?.id,
      promoterCode: input.promoterCode,
      buyerSnapshot: {
        name: input.buyer.name.trim(),
        email: input.buyer.email.trim(),
      },
      eventSnapshot: {
        title: listing.title,
        startsAt: occurrence.startsAt,
        endsAt: occurrence.endsAt,
        locationName:
          occurrence.locationOverride?.name || listing.location.name,
      },
      refundPolicySnapshot: {
        enabled:
          listing.refundPolicy.allowBuyerCancellation ??
          listing.refundPolicy.enabled ??
          true,
        cancellationWindowHours:
          listing.refundPolicy.buyerCancellationWindowHours ??
          listing.refundPolicy.cancellationWindowHours ??
          24,
        allowBuyerCancellation:
          listing.refundPolicy.allowBuyerCancellation ??
          listing.refundPolicy.enabled ??
          true,
        buyerCancellationWindowHours:
          listing.refundPolicy.buyerCancellationWindowHours ??
          listing.refundPolicy.cancellationWindowHours ??
          24,
        allowTicketTransfer:
          listing.refundPolicy.allowTicketTransfer ?? true,
        ticketTransferCutoffHours:
          listing.refundPolicy.ticketTransferCutoffHours ?? 4,
      },
      expiresAt,
      items: preparedItems,
      issueImmediately,
    });

    if (!result.isIdempotentReplay) {
      await createEventAuditLogUseCase({
        actorId: actor.uid,
        actorType: 'user',
        resourceType: 'order',
        resourceId: result.order.id,
        action: issueImmediately
          ? 'order.created_and_issued_free'
          : 'order.created_pending_payment',
        after: {
          orderId: result.order.id,
          totalMinor: result.order.totalMinor,
          status: result.order.status,
        },
      });
    }

    return {
      order: result.order,
      items: result.items,
      issuedTickets: result.issuedTickets,
      isIdempotentReplay: result.isIdempotentReplay,
      serverNow: new Date().toISOString(),
    };
  }

  async confirmTicketOrderPayment(params: {
    orderId: string;
    paymentId?: string;
    paymentIntentId?: string;
  }): Promise<{
    order: TicketOrder;
    tickets: Ticket[];
    alreadyPaid: boolean;
  }> {
    const order = await this.port.getOrderById(params.orderId);
    if (!order) {
      throw new OrderNotFoundError();
    }

    const items = await this.port.listOrderItemsByOrderId(order.id);
    const ticketsToIssue: Array<{
      orderItemId: string;
      ticketTypeId: string;
      holderName: string;
      holderEmail: string;
      qrTokenHash: string;
      ticketTypeSnapshot: {
        name: string;
        kind: TicketType['kind'];
        unitPriceMinor: number;
        effectivePaidMinor?: number;
      };
    }> = [];

    for (const item of items) {
      const perTicketPaidMinor =
        item.quantity > 0 ? Math.floor(item.totalMinor / item.quantity) : 0;
      for (let i = 0; i < item.quantity; i += 1) {
        const { qrTokenHash } = generateOpaqueTicketQrToken();
        ticketsToIssue.push({
          orderItemId: item.id,
          ticketTypeId: item.ticketTypeId,
          holderName: order.buyerSnapshot.name,
          holderEmail: order.buyerSnapshot.email,
          qrTokenHash,
          ticketTypeSnapshot: {
            name: item.ticketTypeSnapshot.name,
            kind: item.ticketTypeSnapshot.kind,
            unitPriceMinor: item.unitPriceMinor,
            effectivePaidMinor: perTicketPaidMinor,
          },
        });
      }
    }

    const confirmed = await this.port.confirmOrderPaymentAndIssueTicketsAtomic({
      orderId: order.id,
      paymentId: params.paymentId,
      paymentIntentId: params.paymentIntentId,
      ticketsToIssue,
    });

    if (!confirmed.alreadyPaid) {
      await createEventAuditLogUseCase({
        actorId: order.buyerId,
        actorType: 'system',
        resourceType: 'order',
        resourceId: order.id,
        action: 'order.paid_and_tickets_issued',
        after: {
          orderId: order.id,
          paymentId: params.paymentId,
          ticketsCount: confirmed.tickets.length,
        },
      });
    }

    return confirmed;
  }

  async updateOrderPaymentState(params: {
    orderId: string;
    status: TicketOrder['status'];
    paymentId?: string;
    paymentIntentId?: string;
  }): Promise<TicketOrder> {
    const order = await this.port.getOrderById(params.orderId);
    if (!order) {
      throw new OrderNotFoundError();
    }
    if (!canTransitionOrderStatus(order.status, params.status)) {
      return order;
    }
    return this.port.updateOrderStatus(order.id, params.status, {
      ...(params.paymentId ? { paymentId: params.paymentId } : {}),
      ...(params.paymentIntentId
        ? { paymentIntentId: params.paymentIntentId }
        : {}),
    });
  }

  async expireTicketOrder(
    orderId: string,
    actor?: TicketingActorContext
  ): Promise<{
    order: TicketOrder | null;
    releasedQuantity: number;
    alreadyReleased: boolean;
  }> {
    if (actor) {
      const existing = await this.port.getOrderById(orderId);
      if (!existing) {
        throw new OrderNotFoundError();
      }
      if (!isActorAdmin(actor) && existing.buyerId !== actor.uid) {
        throw new TicketingDomainError(
          'FORBIDDEN',
          'Sem permissão para expirar este pedido.'
        );
      }
      if (existing.status === 'expired') {
        return {
          order: existing,
          releasedQuantity: 0,
          alreadyReleased: true,
        };
      }
    }
    return this.port.expireOrderAndReleaseInventoryAtomic(orderId);
  }

  async expireAllOverdueOrders(
    nowIso = new Date().toISOString()
  ): Promise<number> {
    const expiredOrders = await this.port.listExpiredPendingOrders(nowIso);
    let count = 0;
    for (const order of expiredOrders) {
      const res = await this.port.expireOrderAndReleaseInventoryAtomic(
        order.id
      );
      if (!res.alreadyReleased) count += 1;
    }
    return count;
  }

  async getOrderForUser(
    actor: TicketingActorContext,
    orderId: string
  ): Promise<{
    order: TicketOrder;
    items: TicketOrderItem[];
    tickets: Ticket[];
    serverNow: string;
  }> {
    const order = await this.port.getOrderById(orderId);
    if (!order) {
      throw new OrderNotFoundError();
    }

    const listing = await getEventListingByIdUseCase(order.eventListingId);
    const isOwnerPartner = listing && listing.ownerId === actor.uid;

    if (
      !isActorAdmin(actor) &&
      !isOwnerPartner &&
      order.buyerId !== actor.uid
    ) {
      throw new TicketingDomainError(
        'FORBIDDEN',
        'Sem permissão para visualizar este pedido.'
      );
    }

    const [items, tickets] = await Promise.all([
      this.port.listOrderItemsByOrderId(order.id),
      this.port.listTicketsByOrderId(order.id),
    ]);

    return {
      order,
      items,
      tickets,
      serverNow: new Date().toISOString(),
    };
  }

  async listUserOrders(actor: TicketingActorContext): Promise<TicketOrder[]> {
    return this.port.listOrdersByBuyerId(actor.uid);
  }

  async listUserTickets(actor: TicketingActorContext): Promise<Ticket[]> {
    return this.port.listTicketsByOwnerUserId(actor.uid);
  }

  async generateTicketPresentationQr(
    actor: TicketingActorContext,
    ticketId: string
  ): Promise<{
    ticketId: string;
    token: string;
    expiresAt: string;
  }> {
    const ticket = await this.port.getTicketById(ticketId);
    if (!ticket) {
      throw new TicketingDomainError('NOT_FOUND', 'Ingresso não encontrado.');
    }
    if (!isActorAdmin(actor) && ticket.ownerUserId !== actor.uid) {
      throw new TicketingDomainError(
        'FORBIDDEN',
        'Apenas o titular pode acessar o QR Code deste ingresso.'
      );
    }
    if (ticket.status !== 'issued') {
      throw new TicketingDomainError(
        'UNPROCESSABLE_ENTITY',
        `QR Code indisponível para ingresso com status ${ticket.status}.`
      );
    }

    const occurrence = await getEventOccurrenceByIdUseCase(ticket.occurrenceId);
    const nowSec = Math.floor(Date.now() / 1000);
    const occEndSec = occurrence
      ? Math.floor(new Date(occurrence.endsAt).getTime() / 1000) + 6 * 3600
      : nowSec + 24 * 3600;
    const expSec = Math.max(nowSec + 3600, occEndSec);

    if (!this.qrTokenPort) {
      throw new TicketingDomainError(
        'SERVICE_UNAVAILABLE',
        'Serviço de assinatura de QR Code não disponível.'
      );
    }

    const token = this.qrTokenPort.issue({
      v: 1,
      ticketId: ticket.id,
      occurrenceId: ticket.occurrenceId,
      qrVersion: ticket.qrVersion || 1,
      iat: nowSec,
      exp: expSec,
    });

    return {
      ticketId: ticket.id,
      token,
      expiresAt: new Date(expSec * 1000).toISOString(),
    };
  }

  async requestTicketRefund(
    actor: TicketingActorContext,
    params: {
      orderId: string;
      ticketId?: string;
      reason: string;
      idempotencyKey: string;
      isEventCanceledByOrganizer?: boolean;
    }
  ): Promise<{ refund: Refund; isReplay: boolean; order: TicketOrder }> {
    const order = await this.port.getOrderById(params.orderId);
    if (!order) {
      throw new OrderNotFoundError();
    }

    const listing = await getEventListingByIdUseCase(order.eventListingId);
    const occurrence = await getEventOccurrenceByIdUseCase(order.occurrenceId);
    const isPartnerOwner = listing && listing.ownerId === actor.uid;
    const isAdmin = isActorAdmin(actor);

    if (!isAdmin && !isPartnerOwner && order.buyerId !== actor.uid) {
      throw new TicketingDomainError(
        'FORBIDDEN',
        'Sem permissão para solicitar reembolso deste pedido.'
      );
    }

    if (order.status !== 'paid' && order.status !== 'partially_refunded') {
      throw new RefundNotAllowedError(
        `Apenas pedidos pagos podem ser reembolsados (status atual: ${order.status}).`
      );
    }

    if (params.ticketId && !isAdmin && !isPartnerOwner) {
      throw new RefundNotAllowedError(
        'O reembolso autoatendimento do comprador aplica-se apenas ao pedido integral.'
      );
    }

    const occurrenceCanceledOrPostponed =
      occurrence?.status === 'canceled' ||
      occurrence?.status === 'postponed' ||
      params.isEventCanceledByOrganizer === true;

    if (!isAdmin && !isPartnerOwner && !occurrenceCanceledOrPostponed) {
      if (!order.refundPolicySnapshot.allowBuyerCancellation) {
        throw new RefundNotAllowedError(
          'A política deste evento não permite cancelamento voluntário.'
        );
      }

      if (occurrence) {
        const startsAtMs = new Date(occurrence.startsAt).getTime();
        const nowMs = Date.now();
        if (nowMs >= startsAtMs) {
          throw new RefundNotAllowedError(
            'Não é possível solicitar reembolso após o início do evento.'
          );
        }
        const windowHours =
          order.refundPolicySnapshot.buyerCancellationWindowHours ??
          order.refundPolicySnapshot.cancellationWindowHours ??
          24;
        const hoursUntilStart = (startsAtMs - nowMs) / (1000 * 60 * 60);
        if (hoursUntilStart < windowHours) {
          throw new RefundNotAllowedError(
            `O prazo para solicitação de reembolso encerrou (${windowHours}h antes do início do evento).`
          );
        }
      }
    }

    let amountMinor = order.totalMinor;
    if (params.ticketId) {
      const ticket = await this.port.getTicketById(params.ticketId);
      if (!ticket || ticket.orderId !== order.id) {
        throw new TicketingDomainError(
          'NOT_FOUND',
          'Ingresso não pertence a este pedido.'
        );
      }
      if (ticket.ticketTypeSnapshot?.effectivePaidMinor !== undefined) {
        amountMinor = ticket.ticketTypeSnapshot.effectivePaidMinor;
      } else {
        const orderItems = await this.port.listOrderItemsByOrderId(order.id);
        const matchingItem = orderItems.find(
          (i) => i.ticketTypeId === ticket.ticketTypeId
        );
        if (matchingItem && matchingItem.quantity > 0) {
          amountMinor = Math.floor(
            matchingItem.totalMinor / matchingItem.quantity
          );
        } else {
          throw new RefundNotAllowedError(
            'Não foi possível calcular a alocação financeira exata deste ingresso.'
          );
        }
      }
    }

    const requestedBy: Refund['requestedBy'] = isAdmin
      ? 'admin'
      : isPartnerOwner
        ? 'partner'
        : 'buyer';

    const { refund, isReplay } = await this.port.createRefundAtomic({
      orderId: order.id,
      ticketId: params.ticketId,
      amountMinor,
      requestedBy,
      reason: params.reason.trim(),
      idempotencyKey: params.idempotencyKey,
    });

    if (!isReplay) {
      await createEventAuditLogUseCase({
        actorId: actor.uid,
        actorType: getAuditActorType(actor, listing?.ownerId),
        resourceType: 'refund',
        resourceId: refund.id,
        action: 'refund.requested',
        reason: params.reason,
        after: {
          orderId: order.id,
          amountMinor,
          status: refund.status,
        },
      });
    }

    return { refund, isReplay, order };
  }

  async finalizeRefundStatus(
    refundId: string,
    status: Refund['status'],
    providerRefundId?: string | null
  ): Promise<Refund> {
    return this.port.updateRefundStatus(refundId, status, providerRefundId);
  }

  async transferTicket(
    actor: TicketingActorContext,
    params: {
      ticketId: string;
      recipientEmail: string;
      recipientName?: string;
      toUserId?: string;
    }
  ): Promise<{
    oldTicket: Ticket;
    newTicket: Ticket;
    transfer: TicketTransfer;
    newRawQrToken: string;
  }> {
    const ticket = await this.port.getTicketById(params.ticketId);
    if (!ticket) {
      throw new TicketingDomainError('NOT_FOUND', 'Ingresso não encontrado.');
    }

    const [order, listing, occurrence] = await Promise.all([
      this.port.getOrderById(ticket.orderId),
      getEventListingByIdUseCase(ticket.eventListingId),
      getEventOccurrenceByIdUseCase(ticket.occurrenceId),
    ]);

    const allowTransfer =
      order?.refundPolicySnapshot?.allowTicketTransfer ??
      listing?.refundPolicy?.allowTicketTransfer ??
      true;

    if (!allowTransfer) {
      throw new TicketingDomainError(
        'UNPROCESSABLE_ENTITY',
        'A política deste evento não permite transferência de titularidade.'
      );
    }

    if (occurrence) {
      if (occurrence.status !== 'scheduled') {
        throw new TicketingDomainError(
          'UNPROCESSABLE_ENTITY',
          'Não é possível transferir ingressos de uma sessão encerrada ou cancelada.'
        );
      }

      const startsAtMs = new Date(occurrence.startsAt).getTime();
      const nowMs = Date.now();
      const cutoffHours =
        order?.refundPolicySnapshot?.ticketTransferCutoffHours ??
        listing?.refundPolicy?.ticketTransferCutoffHours ??
        4;
      const hoursUntilStart = (startsAtMs - nowMs) / (1000 * 60 * 60);
      if (hoursUntilStart < cutoffHours) {
        throw new TicketingDomainError(
          'UNPROCESSABLE_ENTITY',
          `O prazo limite para transferência de titularidade encerrou (${cutoffHours}h antes do início do evento).`
        );
      }
    }

    const { rawQrToken, qrTokenHash } = generateOpaqueTicketQrToken();
    const res = await this.port.transferTicketAtomic({
      ticketId: params.ticketId,
      fromUserId: actor.uid,
      toUserId: params.toUserId,
      recipientEmail: params.recipientEmail.trim(),
      recipientName: params.recipientName?.trim(),
      newQrTokenHash: qrTokenHash,
    });

    await createEventAuditLogUseCase({
      actorId: actor.uid,
      actorType: 'user',
      resourceType: 'ticket',
      resourceId: res.newTicket.id,
      action: 'ticket.transferred',
      before: { oldTicketId: res.oldTicket.id, fromUserId: actor.uid },
      after: {
        newTicketId: res.newTicket.id,
        recipientEmail: params.recipientEmail,
      },
    });

    return {
      ...res,
      newRawQrToken: rawQrToken,
    };
  }

  async checkInTicket(
    actor: TicketingActorContext,
    params: {
      occurrenceId: string;
      ticketId?: string;
      qrToken?: string;
    }
  ): Promise<{ ticket: Ticket; checkIn: EventCheckIn }> {
    const { listing } = await this.assertCanManageOccurrence(
      actor,
      params.occurrenceId
    );

    let targetTicketId = params.ticketId;
    if (!targetTicketId && params.qrToken) {
      const rawToken = params.qrToken.trim();
      if (this.qrTokenPort && rawToken.includes('.')) {
        const verified = this.qrTokenPort.verify(rawToken);
        if (!verified) {
          throw new TicketingDomainError(
            'UNPROCESSABLE_ENTITY',
            'Assinatura ou validade do QR Code inválida.'
          );
        }
        if (verified.occurrenceId !== params.occurrenceId) {
          throw new TicketingDomainError(
            'UNPROCESSABLE_ENTITY',
            'Este ingresso pertence a outra sessão/ocorrência do evento.'
          );
        }
        const ticket = await this.port.getTicketById(verified.ticketId);
        if (!ticket) {
          throw new TicketingDomainError(
            'NOT_FOUND',
            'Ingresso não localizado para o QR Code informado.'
          );
        }
        if ((ticket.qrVersion || 1) !== verified.qrVersion) {
          throw new TicketingDomainError(
            'UNPROCESSABLE_ENTITY',
            'Este QR Code foi substituído ou invalidado por transferência.'
          );
        }
        targetTicketId = ticket.id;
      } else {
        let ticket: Awaited<ReturnType<TicketingPort['getTicketByQrTokenHash']>> = null;
        for (const candidateHash of listTicketQrTokenLookupHashes(rawToken)) {
          ticket = await this.port.getTicketByQrTokenHash(candidateHash);
          if (ticket) break;
        }
        if (!ticket) {
          throw new TicketingDomainError(
            'NOT_FOUND',
            'Ingresso não localizado para o QR Code informado.'
          );
        }
        targetTicketId = ticket.id;
      }
    }

    if (!targetTicketId) {
      throw new TicketingDomainError(
        'INVALID_ARGUMENT',
        'ID do ingresso ou QR Code obrigatório.'
      );
    }

    const result = await this.port.checkInTicketAtomic({
      ticketId: targetTicketId,
      occurrenceId: params.occurrenceId,
      checkedInBy: actor.uid,
      source: 'online',
    });

    await createEventAuditLogUseCase({
      actorId: actor.uid,
      actorType: getAuditActorType(actor, listing.ownerId),
      resourceType: 'ticket',
      resourceId: result.ticket.id,
      action: 'ticket.checked_in',
      after: {
        occurrenceId: params.occurrenceId,
        checkedInAt: result.checkIn.checkedInAt,
        source: 'online',
      },
    });

    return result;
  }

  async prepareOfflineCheckInSession(
    actor: TicketingActorContext,
    params: {
      occurrenceId: string;
      stationId?: string;
    }
  ): Promise<{
    session: OfflineCheckInSession;
    manifest: OfflineCheckInManifest;
  }> {
    const { occurrence, listing } = await this.assertCanManageOccurrence(
      actor,
      params.occurrenceId
    );

    const nowMs = Date.now();
    const startsAtMs = new Date(occurrence.startsAt).getTime();
    const endsAtMs = new Date(occurrence.endsAt).getTime();
    const minPrepMs = startsAtMs - 24 * 3600 * 1000;
    const maxExpireMs = endsAtMs + 6 * 3600 * 1000;

    if (nowMs < minPrepMs) {
      throw new TicketingDomainError(
        'UNPROCESSABLE_ENTITY',
        'A preparação offline só é permitida a partir de 24 horas antes do início da ocorrência.'
      );
    }
    if (nowMs > maxExpireMs) {
      throw new TicketingDomainError(
        'UNPROCESSABLE_ENTITY',
        'O período operacional desta ocorrência para check-in offline já encerrou.'
      );
    }

    if (!this.qrTokenPort) {
      throw new TicketingDomainError(
        'SERVICE_UNAVAILABLE',
        'Chave pública de validação offline não configurada.'
      );
    }

    const { keyId, publicKeyJwk } = this.qrTokenPort.getPublicKeyMetadata();
    const allTickets = await this.port.listTicketsByOccurrenceId(occurrence.id);
    const eligibleTickets = allTickets
      .filter((t) => t.status === 'issued')
      .map((t) => ({
        ticketIdHash: hashTicketIdForOfflineManifest(t.id),
        qrVersion: t.qrVersion || 1,
      }));

    const issuedAt = new Date(nowMs).toISOString();
    const expiresAt = new Date(maxExpireMs).toISOString();
    const stationId = params.stationId?.trim() || 'station-default';

    const manifestPayloadForHash = JSON.stringify({
      occurrenceId: occurrence.id,
      eventListingId: listing.id,
      stationId,
      issuedAt,
      expiresAt,
      keyId,
      tickets: eligibleTickets,
    });
    const manifestHash = crypto
      .createHash('sha256')
      .update(manifestPayloadForHash)
      .digest('hex');

    const session = await this.port.createOfflineCheckInSession({
      partnerId: listing.ownerId,
      occurrenceId: occurrence.id,
      eventListingId: listing.id,
      stationId,
      issuedAt,
      expiresAt,
      manifestHash,
      status: 'active',
      keyId,
    });

    const manifest: OfflineCheckInManifest = {
      version: 1,
      sessionId: session.id,
      occurrenceId: occurrence.id,
      eventListingId: listing.id,
      stationId,
      issuedAt,
      expiresAt,
      keyId,
      publicKeyJwk,
      tickets: eligibleTickets,
    };

    await createEventAuditLogUseCase({
      actorId: actor.uid,
      actorType: getAuditActorType(actor, listing.ownerId),
      resourceType: 'occurrence',
      resourceId: occurrence.id,
      action: 'offline_checkin.session_prepared',
      after: {
        sessionId: session.id,
        stationId,
        eligibleCount: eligibleTickets.length,
        expiresAt,
      },
    });

    return { session, manifest };
  }

  async syncOfflineCheckInEvents(
    actor: TicketingActorContext,
    params: {
      sessionId: string;
      events: OfflineCheckInEvent[];
    }
  ): Promise<{
    sessionId: string;
    results: OfflineCheckInSyncResultItem[];
  }> {
    const session = await this.port.getOfflineCheckInSessionById(
      params.sessionId
    );
    if (!session) {
      throw new TicketingDomainError(
        'NOT_FOUND',
        'Sessão de check-in offline não encontrada.'
      );
    }

    const { listing } = await this.assertCanManageOccurrence(
      actor,
      session.occurrenceId
    );

    if (session.status !== 'active') {
      throw new TicketingDomainError(
        'UNPROCESSABLE_ENTITY',
        `Sessão offline não está ativa (status: ${session.status}).`
      );
    }

    if (Date.now() > new Date(session.expiresAt).getTime()) {
      return {
        sessionId: session.id,
        results: params.events.map((ev) => ({
          clientEventId: ev.clientEventId,
          status: 'expired',
        })),
      };
    }

    const results = await this.port.syncOfflineCheckInsAtomic({
      session,
      checkedInBy: actor.uid,
      events: params.events,
    });

    await createEventAuditLogUseCase({
      actorId: actor.uid,
      actorType: getAuditActorType(actor, listing.ownerId),
      resourceType: 'occurrence',
      resourceId: session.occurrenceId,
      action: 'offline_checkin.synced',
      after: {
        sessionId: session.id,
        eventsProcessed: params.events.length,
      },
    });

    return {
      sessionId: session.id,
      results,
    };
  }

  async getEventSalesAnalytics(
    actor: TicketingActorContext,
    eventListingId: string,
    occurrenceId?: string
  ): Promise<EventSalesAnalytics> {
    const listing = await getEventListingByIdUseCase(eventListingId);
    if (!listing) {
      throw new TicketingDomainError('NOT_FOUND', 'Evento não encontrado.');
    }
    if (!isActorAdmin(actor) && listing.ownerId !== actor.uid) {
      throw new TicketingDomainError(
        'FORBIDDEN',
        'Sem permissão para visualizar métricas financeiras deste evento.'
      );
    }

    const [orders, tickets, refunds] = await Promise.all([
      occurrenceId
        ? this.port.listOrdersByOccurrenceId(occurrenceId)
        : this.port.listOrdersByEventListingId(eventListingId),
      occurrenceId
        ? this.port.listTicketsByOccurrenceId(occurrenceId)
        : this.port.listTicketsByEventListingId(eventListingId),
      this.port.listRefundsByEventListingId(eventListingId),
    ]);

    const paidOrders = orders.filter(
      (o) =>
        o.status === 'paid' ||
        o.status === 'partially_refunded' ||
        o.status === 'refunded'
    );

    const grossSalesMinor = paidOrders.reduce(
      (sum, o) => sum + o.subtotalMinor,
      0
    );
    const discountsMinor = paidOrders.reduce(
      (sum, o) => sum + o.discountMinor,
      0
    );
    const platformFeesMinor = paidOrders.reduce(
      (sum, o) => sum + o.platformFeeMinor,
      0
    );
    const paymentFeesMinor = paidOrders.reduce(
      (sum, o) => sum + o.paymentFeeMinor,
      0
    );

    const orderIdSet = new Set(orders.map((o) => o.id));
    const approvedRefunds = refunds.filter(
      (r) => r.status === 'approved' && orderIdSet.has(r.orderId)
    );
    const refundsMinor = approvedRefunds.reduce(
      (sum, r) => sum + r.amountMinor,
      0
    );

    const netSalesMinor = Math.max(
      0,
      grossSalesMinor -
        discountsMinor -
        platformFeesMinor -
        paymentFeesMinor -
        refundsMinor
    );

    const activeTickets = tickets.filter(
      (t) => t.status === 'issued' || t.status === 'checked_in'
    );
    const ticketsIssued = activeTickets.length;
    const ticketsCheckedIn = tickets.filter(
      (t) => t.status === 'checked_in'
    ).length;
    const ticketsRefunded = tickets.filter(
      (t) => t.status === 'refunded'
    ).length;
    const checkInRate =
      ticketsIssued > 0
        ? Number(((ticketsCheckedIn / ticketsIssued) * 100).toFixed(2))
        : 0;

    const byTypeMap = new Map<
      string,
      { ticketTypeId: string; name?: string; sold: number; grossMinor: number }
    >();

    for (const t of activeTickets) {
      const curr = byTypeMap.get(t.ticketTypeId) || {
        ticketTypeId: t.ticketTypeId,
        name: t.ticketTypeSnapshot?.name,
        sold: 0,
        grossMinor: 0,
      };
      curr.sold += 1;
      curr.grossMinor += t.ticketTypeSnapshot?.unitPriceMinor ?? 0;
      byTypeMap.set(t.ticketTypeId, curr);
    }

    return {
      grossSalesMinor,
      discountsMinor,
      platformFeesMinor,
      paymentFeesMinor,
      refundsMinor,
      netSalesMinor,
      ticketsIssued,
      ticketsCheckedIn,
      ticketsRefunded,
      checkInRate,
      byTicketType: Array.from(byTypeMap.values()),
    };
  }

  async listEventOrdersForPartnerOrAdmin(
    actor: TicketingActorContext,
    eventListingId: string
  ): Promise<TicketOrder[]> {
    const listing = await getEventListingByIdUseCase(eventListingId);
    if (!listing) {
      throw new TicketingDomainError('NOT_FOUND', 'Evento não encontrado.');
    }
    if (!isActorAdmin(actor) && listing.ownerId !== actor.uid) {
      throw new TicketingDomainError(
        'FORBIDDEN',
        'Sem permissão para listar pedidos deste evento.'
      );
    }
    return this.port.listOrdersByEventListingId(eventListingId);
  }

  async listEventTicketsForPartnerOrAdmin(
    actor: TicketingActorContext,
    eventListingId: string
  ): Promise<Ticket[]> {
    const listing = await getEventListingByIdUseCase(eventListingId);
    if (!listing) {
      throw new TicketingDomainError('NOT_FOUND', 'Evento não encontrado.');
    }
    if (!isActorAdmin(actor) && listing.ownerId !== actor.uid) {
      throw new TicketingDomainError(
        'FORBIDDEN',
        'Sem permissão para listar participantes deste evento.'
      );
    }
    return this.port.listTicketsByEventListingId(eventListingId);
  }

  async listEventCheckInsForPartnerOrAdmin(
    actor: TicketingActorContext,
    eventListingId: string
  ): Promise<EventCheckIn[]> {
    const listing = await getEventListingByIdUseCase(eventListingId);
    if (!listing) {
      throw new TicketingDomainError('NOT_FOUND', 'Evento não encontrado.');
    }
    if (!isActorAdmin(actor) && listing.ownerId !== actor.uid) {
      throw new TicketingDomainError(
        'FORBIDDEN',
        'Sem permissão para listar check-ins deste evento.'
      );
    }
    return this.port.listCheckInsByEventListingId(eventListingId);
  }

  async listEventRefundsForPartnerOrAdmin(
    actor: TicketingActorContext,
    eventListingId: string
  ): Promise<Refund[]> {
    const listing = await getEventListingByIdUseCase(eventListingId);
    if (!listing) {
      throw new TicketingDomainError('NOT_FOUND', 'Evento não encontrado.');
    }
    if (!isActorAdmin(actor) && listing.ownerId !== actor.uid) {
      throw new TicketingDomainError(
        'FORBIDDEN',
        'Sem permissão para listar reembolsos deste evento.'
      );
    }
    return this.port.listRefundsByEventListingId(eventListingId);
  }

  async getVerifiedAttendanceForReview(params: {
    userId: string;
    occurrenceId: string;
    ticketId: string;
  }): Promise<VerifiedAttendanceForReview> {
    const ticket = await this.port.getTicketById(params.ticketId);
    if (!ticket) {
      throw new TicketNotEligibleForReviewError('Ingresso não encontrado.');
    }
    if (ticket.ownerUserId !== params.userId) {
      throw new TicketNotEligibleForReviewError(
        'Apenas o titular do ingresso pode avaliar o evento.'
      );
    }
    if (ticket.occurrenceId !== params.occurrenceId) {
      throw new TicketNotEligibleForReviewError(
        'O ingresso informado não pertence a esta ocorrência.'
      );
    }
    if (ticket.status !== 'checked_in') {
      throw new TicketNotEligibleForReviewError(
        'Somente participantes com check-in confirmado podem avaliar o evento.'
      );
    }

    const occurrence = await getEventOccurrenceByIdUseCase(params.occurrenceId);
    if (!occurrence) {
      throw new TicketNotEligibleForReviewError(
        'Sessão do evento não encontrada.'
      );
    }

    const isCompleted =
      occurrence.status === 'completed' ||
      new Date(occurrence.endsAt).getTime() <= Date.now();
    if (!isCompleted) {
      throw new TicketNotEligibleForReviewError(
        'A avaliação só pode ser enviada após o encerramento da sessão.'
      );
    }

    const listing = await getEventListingByIdUseCase(ticket.eventListingId);
    if (!listing) {
      throw new TicketNotEligibleForReviewError('Evento não encontrado.');
    }

    return {
      eligible: true,
      ticketId: ticket.id,
      occurrenceId: occurrence.id,
      eventListingId: listing.id,
      ownerUserId: ticket.ownerUserId,
      eventOwnerId: listing.ownerId,
      eventPartnerId: listing.partnerId,
      eventTitle: listing.title,
    };
  }

  async moveOrdersAndTicketsToOccurrence(
    actor: TicketingActorContext,
    params: {
      fromOccurrenceId: string;
      toOccurrenceId: string;
    }
  ): Promise<{ movedOrdersCount: number; movedTicketsCount: number }> {
    const { listing } = await this.assertCanManageOccurrence(
      actor,
      params.fromOccurrenceId
    );
    const targetOccurrence = await getEventOccurrenceByIdUseCase(
      params.toOccurrenceId
    );
    if (
      !targetOccurrence ||
      targetOccurrence.eventListingId !== listing.id
    ) {
      throw new TicketingDomainError(
        'UNPROCESSABLE_ENTITY',
        'A nova ocorrência deve pertencer ao mesmo evento.'
      );
    }

    const moved = await this.port.moveOrdersAndTicketsToOccurrenceAtomic({
      fromOccurrenceId: params.fromOccurrenceId,
      toOccurrenceId: params.toOccurrenceId,
      newStartsAt: targetOccurrence.startsAt,
      newEndsAt: targetOccurrence.endsAt,
    });

    await createEventAuditLogUseCase({
      actorId: actor.uid,
      actorType: getAuditActorType(actor, listing.ownerId),
      resourceType: 'occurrence',
      resourceId: params.fromOccurrenceId,
      action: 'occurrence.orders_migrated',
      after: {
        toOccurrenceId: params.toOccurrenceId,
        ...moved,
      },
    });

    return moved;
  }

  async createPromoCode(
    actor: TicketingActorContext,
    input: {
      eventListingId: string;
      code: string;
      type: 'percentage' | 'fixed';
      valueMinor?: number;
      percentage?: number;
      maxUses?: number;
      startsAt?: string;
      endsAt?: string;
      ticketTypeIds?: string[];
      isActive?: boolean;
    }
  ): Promise<EventPromoCode> {
    const listing = await getEventListingByIdUseCase(input.eventListingId);
    if (!listing) {
      throw new TicketingDomainError('NOT_FOUND', 'Evento não encontrado.');
    }
    if (!isActorAdmin(actor) && listing.ownerId !== actor.uid) {
      throw new TicketingDomainError(
        'FORBIDDEN',
        'Sem permissão para criar cupons neste evento.'
      );
    }

    return this.port.createPromoCode({
      eventListingId: input.eventListingId,
      code: input.code,
      type: input.type,
      valueMinor: input.valueMinor,
      percentage: input.percentage,
      maxUses: input.maxUses,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      ticketTypeIds: input.ticketTypeIds,
      isActive: input.isActive ?? true,
    });
  }

  async joinWaitlist(
    actor: TicketingActorContext,
    input: {
      occurrenceId: string;
      ticketTypeId?: string;
      quantity: number;
    }
  ): Promise<EventWaitlistEntry> {
    const occurrence = await getEventOccurrenceByIdUseCase(input.occurrenceId);
    if (!occurrence) {
      throw new TicketingDomainError(
        'NOT_FOUND',
        'Sessão do evento não encontrada.'
      );
    }
    return this.port.createWaitlistEntry({
      occurrenceId: input.occurrenceId,
      userId: actor.uid,
      ticketTypeId: input.ticketTypeId,
      quantity: input.quantity,
    });
  }
}
