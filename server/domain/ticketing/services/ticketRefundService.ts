import {
  createEventAuditLogUseCase,
  getEventListingByIdUseCase,
  getEventOccurrenceByIdUseCase,
} from '../../events';
import {
  OrderNotFoundError,
  RefundNotAllowedError,
  TicketingDomainError,
} from '../errors/ticketingDomainError';
import type { TicketingPort } from '../ports/ticketingPort';
import { type Refund, type TicketOrder } from '../types/ticketingTypes';
import { getAuditActorType, isActorAdmin, type TicketingActorContext } from './ticketingAccess';

/** Reembolso pedido pelo comprador e conclusão pelo webhook. */
export class TicketRefundService {
  constructor(private readonly port: TicketingPort) {}

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
        throw new TicketingDomainError('NOT_FOUND', 'Ingresso não pertence a este pedido.');
      }
      if (ticket.ticketTypeSnapshot?.effectivePaidMinor !== undefined) {
        amountMinor = ticket.ticketTypeSnapshot.effectivePaidMinor;
      } else {
        const orderItems = await this.port.listOrderItemsByOrderId(order.id);
        const matchingItem = orderItems.find((i) => i.ticketTypeId === ticket.ticketTypeId);
        if (matchingItem && matchingItem.quantity > 0) {
          amountMinor = Math.floor(matchingItem.totalMinor / matchingItem.quantity);
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
}
