import {
  createEventAuditLogUseCase,
  getEventListingByIdUseCase,
  getEventOccurrenceByIdUseCase,
} from '../../events';
import { TicketingDomainError } from '../errors/ticketingDomainError';
import type { TicketingPort } from '../ports/ticketingPort';
import { type EventWaitlistEntry, type Ticket, type TicketTransfer } from '../types/ticketingTypes';
import { generateOpaqueTicketQrToken } from '../utils/qrToken';
import {
  assertCanManageOccurrence,
  getAuditActorType,
  type TicketingActorContext,
} from './ticketingAccess';

/** Titularidade do ingresso: transferência, troca de sessão e lista de espera. */
export class TicketHolderService {
  constructor(private readonly port: TicketingPort) {}

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
}
