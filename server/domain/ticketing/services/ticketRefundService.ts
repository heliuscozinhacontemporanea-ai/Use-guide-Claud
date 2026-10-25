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
import { calculateBuyerRefund } from '../../../shared/kernel/cancellationPolicy';
import type { TicketingPort } from '../ports/ticketingPort';
import { type Refund, type TicketOrder } from '../types/ticketingTypes';
import { getAuditActorType, isActorAdmin, type TicketingActorContext } from './ticketingAccess';

/**
 * Cancelamento pelo próprio comprador (D14): arrependimento de 7 dias até 48 h antes do início, ou a política
 * gravada no pedido. A taxa de serviço só volta no arrependimento.
 */
interface RefundAmount {
  amountMinor: number;
  serviceFeeMinor: number;
}

function buyerSelfServiceRefund(order: TicketOrder, startsAt: string | undefined): RefundAmount {
  if (!startsAt) {
    throw new RefundNotAllowedError('Sessão do evento não encontrada para calcular o reembolso.');
  }
  const refund = calculateBuyerRefund({
    family: 'event',
    policy: order.salesPolicySnapshot.cancellationPolicy,
    purchasedAt: order.paidAt ?? order.createdAt,
    startsAt,
    now: new Date(),
    paidMinor: order.totalMinor - order.serviceFeeMinor,
    serviceFeeMinor: order.serviceFeeMinor,
  });
  const amountMinor = refund.refundMinor + refund.serviceFeeRefundMinor;
  if (amountMinor <= 0) {
    throw new RefundNotAllowedError(
      'Pela política deste evento, o cancelamento agora não tem reembolso.'
    );
  }
  return { amountMinor, serviceFeeMinor: refund.serviceFeeRefundMinor };
}

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

    const { amountMinor, serviceFeeMinor } = params.ticketId
      ? await this.ticketRefund(order, params.ticketId)
      : !isAdmin && !isPartnerOwner && !occurrenceCanceledOrPostponed
        ? buyerSelfServiceRefund(order, occurrence?.startsAt)
        : // Cancelamento pelo organizador (ou pelo admin): reembolso integral, com a taxa de serviço (D14).
          { amountMinor: order.totalMinor, serviceFeeMinor: order.serviceFeeMinor };

    const requestedBy: Refund['requestedBy'] = isAdmin
      ? 'admin'
      : isPartnerOwner
        ? 'partner'
        : 'buyer';

    const { refund, isReplay } = await this.port.createRefundAtomic({
      orderId: order.id,
      ticketId: params.ticketId,
      amountMinor,
      serviceFeeMinor,
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

  /** Ingresso avulso (só organizador ou admin): o que foi pago por ele, com a parte da taxa de serviço. */
  private async ticketRefund(order: TicketOrder, ticketId: string): Promise<RefundAmount> {
    const ticket = await this.port.getTicketById(ticketId);
    if (!ticket || ticket.orderId !== order.id) {
      throw new TicketingDomainError('NOT_FOUND', 'Ingresso não pertence a este pedido.');
    }
    const orderItems = await this.port.listOrderItemsByOrderId(order.id);
    const item = orderItems.find((candidate) => candidate.ticketTypeId === ticket.ticketTypeId);
    if (!item || item.quantity <= 0) {
      throw new RefundNotAllowedError(
        'Não foi possível calcular a alocação financeira exata deste ingresso.'
      );
    }
    const paidMinor =
      ticket.ticketTypeSnapshot?.effectivePaidMinor ?? Math.floor(item.totalMinor / item.quantity);
    const serviceFeeMinor = Math.floor(item.allocatedServiceFeeMinor / item.quantity);
    return { amountMinor: paidMinor + serviceFeeMinor, serviceFeeMinor };
  }

  async finalizeRefundStatus(
    refundId: string,
    status: Refund['status'],
    providerRefundId?: string | null
  ): Promise<Refund> {
    return this.port.updateRefundStatus(refundId, status, providerRefundId);
  }
}
