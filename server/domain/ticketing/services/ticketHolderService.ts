import {
  createEventAuditLogUseCase,
  getEventListingByIdUseCase,
  getEventOccurrenceByIdUseCase,
} from '../../events';
import { TicketingDomainError } from '../errors/ticketingDomainError';
import type { TicketingPort } from '../ports/ticketingPort';
import type {
  EventWaitlistEntry,
  Ticket,
  TicketOrder,
  TicketTransfer,
} from '../types/ticketingTypes';
import { generateOpaqueTicketQrToken } from '../utils/qrToken';
import {
  assertCanManageOccurrence,
  getAuditActorType,
  type TicketingActorContext,
} from './ticketingAccess';

/** Titularidade do ingresso: transferência, troca de sessão e lista de espera. */
export class TicketHolderService {
  constructor(private readonly port: TicketingPort) {}

  /** Exclusão de conta (§7.5): quantos registros perderam o dado pessoal. */
  async anonymizeUser(uid: string): Promise<number> {
    const result = await this.port.anonymizeUser(uid);
    return result.orders + result.tickets + result.transfers + result.waitlist;
  }

  async transferTicket(
    actor: TicketingActorContext,
    params: {
      ticketId: string;
      recipientEmail?: string;
      recipientName?: string;
      toUserId?: string;
      /** De quem o destinatário recebeu, para ele saber a quem devolver (D21). */
      receivedFrom?: Ticket['receivedFrom'];
      /** Devolução: o ingresso recebido volta para quem comprou (D21). */
      returnToBuyer?: boolean;
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
      order?.salesPolicySnapshot.allowTicketTransfer ??
      listing?.salesPolicy.allowTicketTransfer ??
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
        order?.salesPolicySnapshot.ticketTransferCutoffHours ??
        listing?.salesPolicy.ticketTransferCutoffHours ??
        4;
      const hoursUntilStart = (startsAtMs - nowMs) / (1000 * 60 * 60);
      if (hoursUntilStart < cutoffHours) {
        throw new TicketingDomainError(
          'UNPROCESSABLE_ENTITY',
          `O prazo limite para transferência de titularidade encerrou (${cutoffHours}h antes do início do evento).`
        );
      }
    }

    const recipient = this.resolveRecipient(ticket, order, params);
    const { rawQrToken, qrTokenHash } = generateOpaqueTicketQrToken();
    const res = await this.port.transferTicketAtomic({
      ticketId: params.ticketId,
      fromUserId: actor.uid,
      toUserId: recipient.toUserId,
      recipientEmail: recipient.email,
      recipientName: recipient.name,
      newQrTokenHash: qrTokenHash,
      ...(recipient.receivedFrom ? { receivedFrom: recipient.receivedFrom } : {}),
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
        toUserId: recipient.toUserId,
      },
    });

    return {
      ...res,
      newRawQrToken: rawQrToken,
    };
  }

  async moveOrdersAndTicketsToOccurrence(
    actor: TicketingActorContext,
    params: {
      fromOccurrenceId: string;
      toOccurrenceId: string;
    }
  ): Promise<{ movedOrdersCount: number; movedTicketsCount: number }> {
    const { listing } = await assertCanManageOccurrence(actor, params.fromOccurrenceId);
    const targetOccurrence = await getEventOccurrenceByIdUseCase(params.toOccurrenceId);
    if (!targetOccurrence || targetOccurrence.eventListingId !== listing.id) {
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
      throw new TicketingDomainError('NOT_FOUND', 'Sessão do evento não encontrada.');
    }
    return this.port.createWaitlistEntry({
      occurrenceId: input.occurrenceId,
      userId: actor.uid,
      ticketTypeId: input.ticketTypeId,
      quantity: input.quantity,
    });
  }

  /**
   * Ingresso comprado vai para quem o comprador escolher; ingresso recebido só volta para quem
   * comprou (D21), com o e-mail e o nome do pedido, sem o "recebido de".
   */
  private resolveRecipient(
    ticket: Ticket,
    order: TicketOrder | null,
    params: {
      toUserId?: string;
      recipientEmail?: string;
      recipientName?: string;
      receivedFrom?: Ticket['receivedFrom'];
      returnToBuyer?: boolean;
    }
  ): { toUserId: string; email: string; name?: string; receivedFrom?: Ticket['receivedFrom'] } {
    const received = !!order && ticket.ownerUserId !== order.buyerId;
    if (params.returnToBuyer) {
      if (!received || !order?.buyerSnapshot.email) {
        throw new TicketingDomainError(
          'UNPROCESSABLE_ENTITY',
          'Este ingresso não foi recebido por transferência.'
        );
      }
      return {
        toUserId: order.buyerId,
        email: order.buyerSnapshot.email,
        name: order.buyerSnapshot.name || undefined,
      };
    }
    if (received) {
      throw new TicketingDomainError(
        'TRANSFER_ONLY_TO_BUYER',
        'Ingresso recebido só pode ser devolvido para quem comprou.'
      );
    }
    if (!params.toUserId || !params.recipientEmail?.trim()) {
      throw new TicketingDomainError('INVALID_ARGUMENT', 'Destinatário obrigatório.');
    }
    return {
      toUserId: params.toUserId,
      email: params.recipientEmail.trim(),
      name: params.recipientName?.trim(),
      receivedFrom: params.receivedFrom,
    };
  }
}
