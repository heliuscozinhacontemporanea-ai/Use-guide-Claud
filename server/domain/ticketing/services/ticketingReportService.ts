import { getEventListingByIdUseCase, getEventOccurrenceByIdUseCase } from '../../events';
import {
  TicketNotEligibleForReviewError,
  TicketingDomainError,
} from '../errors/ticketingDomainError';
import type { TicketingPort } from '../ports/ticketingPort';
import {
  type EventCheckIn,
  type EventSalesAnalytics,
  type Refund,
  type Ticket,
  type TicketOrder,
  type VerifiedAttendanceForReview,
} from '../types/ticketingTypes';
import { isActorAdmin, type TicketingActorContext } from './ticketingAccess';

/** Relatórios do evento para o organizador e o admin, e presença verificada para avaliações. */
export class TicketingReportService {
  constructor(private readonly port: TicketingPort) {}

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
      (o) => o.status === 'paid' || o.status === 'partially_refunded' || o.status === 'refunded'
    );

    const grossSalesMinor = paidOrders.reduce((sum, o) => sum + o.subtotalMinor, 0);
    const discountsMinor = paidOrders.reduce((sum, o) => sum + o.discountMinor, 0);
    const platformFeesMinor = paidOrders.reduce((sum, o) => sum + o.platformFeeMinor, 0);
    const paymentFeesMinor = paidOrders.reduce((sum, o) => sum + o.paymentFeeMinor, 0);

    const orderIdSet = new Set(orders.map((o) => o.id));
    const approvedRefunds = refunds.filter(
      (r) => r.status === 'approved' && orderIdSet.has(r.orderId)
    );
    const refundsMinor = approvedRefunds.reduce((sum, r) => sum + r.amountMinor, 0);

    const netSalesMinor = Math.max(
      0,
      grossSalesMinor - discountsMinor - platformFeesMinor - paymentFeesMinor - refundsMinor
    );

    const activeTickets = tickets.filter((t) => t.status === 'issued' || t.status === 'checked_in');
    const ticketsIssued = activeTickets.length;
    const ticketsCheckedIn = tickets.filter((t) => t.status === 'checked_in').length;
    const ticketsRefunded = tickets.filter((t) => t.status === 'refunded').length;
    const checkInRate =
      ticketsIssued > 0 ? Number(((ticketsCheckedIn / ticketsIssued) * 100).toFixed(2)) : 0;

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
      throw new TicketNotEligibleForReviewError('Sessão do evento não encontrada.');
    }

    const isCompleted =
      occurrence.status === 'completed' || new Date(occurrence.endsAt).getTime() <= Date.now();
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
}
