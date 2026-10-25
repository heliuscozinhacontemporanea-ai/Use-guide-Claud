import { createEventAuditLogUseCase, getEventListingByIdUseCase } from '../../events';
import { OrderNotFoundError, TicketingDomainError } from '../errors/ticketingDomainError';
import type { TicketingPort } from '../ports/ticketingPort';
import {
  PlatformFeeConfigError,
  resolvePlatformFeeConfig,
} from '../../../shared/kernel/platformFees';
import {
  canTransitionOrderStatus,
  CHECKOUT_RESERVATION_MINUTES,
  type Ticket,
  type TicketOrder,
  type TicketOrderItem,
  type TicketType,
} from '../types/ticketingTypes';
import { generateOpaqueTicketQrToken } from '../utils/qrToken';
import {
  assertBuyerWithinTicketLimit,
  loadActivePromo,
  loadOccurrenceOnSale,
} from './orders/orderSaleGuards';
import { prepareOrderItems } from './orders/prepareOrderItems';
import { isActorAdmin, type TicketingActorContext } from './ticketingAccess';

function loadFeeConfig() {
  try {
    return resolvePlatformFeeConfig();
  } catch (error) {
    if (error instanceof PlatformFeeConfigError) {
      // Sem taxa configurada a venda para (AGENTS.md §2.2.5); o nome da variável fica só no log.
      console.error('[ticketing] taxas da plataforma não configuradas', { message: error.message });
      throw new TicketingDomainError('SERVICE_UNAVAILABLE', 'Vendas indisponíveis no momento.');
    }
    throw error;
  }
}

/** Pedidos de ingresso: criação com reserva de estoque, pagamento e expiração. */
export class TicketOrderService {
  constructor(private readonly port: TicketingPort) {}

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
    const nowMs = Date.now();
    const { occurrence, listing } = await loadOccurrenceOnSale(input.occurrenceId, nowMs);

    const existingReplayOrder = await this.port.getOrderByIdempotencyKey(
      actor.uid,
      input.idempotencyKey
    );
    if (!existingReplayOrder) {
      await assertBuyerWithinTicketLimit(this.port, {
        buyerUid: actor.uid,
        occurrenceId: occurrence.id,
        requested: input.items.reduce((sum, item) => sum + item.quantity, 0),
        max: listing.maxTicketsPerUserPerOccurrence ?? 5,
        nowMs,
      });
    }

    const allTypes = await this.port.listTicketTypesByOccurrenceId(occurrence.id);
    const typeMap = new Map(allTypes.map((t) => [t.id, t]));
    const totalCommitted = allTypes.reduce((sum, t) => sum + t.soldCount + t.reservedCount, 0);

    const promo = input.promoCode
      ? await loadActivePromo(this.port, listing.id, input.promoCode, nowMs)
      : null;

    const {
      subtotalMinor,
      discountMinor,
      platformFeeMinor,
      paymentFeeMinor,
      serviceFeeMinor,
      totalMinor,
      preparedItems,
    } = prepareOrderItems({
      items: input.items,
      typeMap,
      occurrenceCapacity: occurrence.capacity,
      totalCommitted,
      nowMs,
      promo,
      buyer: input.buyer,
      feeConfig: loadFeeConfig(),
      serviceFeeMode: listing.salesPolicy.serviceFeeMode,
    });

    const expiresAt = new Date(nowMs + CHECKOUT_RESERVATION_MINUTES * 60 * 1000).toISOString();
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
      serviceFeeMinor,
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
        locationName: occurrence.locationOverride?.name || listing.location.name,
      },
      salesPolicySnapshot: { ...listing.salesPolicy },
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
      ...(params.paymentIntentId ? { paymentIntentId: params.paymentIntentId } : {}),
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
        throw new TicketingDomainError('FORBIDDEN', 'Sem permissão para expirar este pedido.');
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

  async expireAllOverdueOrders(nowIso = new Date().toISOString()): Promise<number> {
    const expiredOrders = await this.port.listExpiredPendingOrders(nowIso);
    let count = 0;
    for (const order of expiredOrders) {
      const res = await this.port.expireOrderAndReleaseInventoryAtomic(order.id);
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

    if (!isActorAdmin(actor) && !isOwnerPartner && order.buyerId !== actor.uid) {
      throw new TicketingDomainError('FORBIDDEN', 'Sem permissão para visualizar este pedido.');
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
}
