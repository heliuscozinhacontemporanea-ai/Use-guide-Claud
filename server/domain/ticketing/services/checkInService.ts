import { createEventAuditLogUseCase, getEventOccurrenceByIdUseCase } from '../../events';
import { TicketingDomainError } from '../errors/ticketingDomainError';
import type { TicketQrTokenPort } from '../ports/ticketQrTokenPort';
import type { TicketingPort } from '../ports/ticketingPort';
import { type EventCheckIn, type Ticket } from '../types/ticketingTypes';
import { listTicketQrTokenLookupHashes } from '../utils/qrToken';
import {
  assertCanManageOccurrence,
  getAuditActorType,
  isActorAdmin,
  type TicketingActorContext,
} from './ticketingAccess';

/** QR do ingresso e check-in online. */
export class CheckInService {
  constructor(
    private readonly port: TicketingPort,
    private readonly qrTokenPort?: TicketQrTokenPort
  ) {}

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

  async checkInTicket(
    actor: TicketingActorContext,
    params: {
      occurrenceId: string;
      ticketId?: string;
      qrToken?: string;
    }
  ): Promise<{ ticket: Ticket; checkIn: EventCheckIn }> {
    const { listing } = await assertCanManageOccurrence(actor, params.occurrenceId);

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
      throw new TicketingDomainError('INVALID_ARGUMENT', 'ID do ingresso ou QR Code obrigatório.');
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
}
