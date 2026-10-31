import { createEventAuditLogUseCase, getEventOccurrenceByIdUseCase } from '../../events';
import { TicketingDomainError } from '../errors/ticketingDomainError';
import type { TicketQrTokenPort } from '../ports/ticketQrTokenPort';
import type { TicketingPort } from '../ports/ticketingPort';
import { type EventCheckIn, type Ticket } from '../types/ticketingTypes';
import { listTicketQrTokenLookupHashes } from '../utils/qrToken';
import {
  deriveTicketCheckInCode,
  normalizeTicketCheckInCode,
  ticketCheckInCodeMatches,
} from '../utils/ticketCheckInCode';
import {
  TICKET_CODE_FAILURE_WINDOW_MS,
  TICKET_CODE_MAX_FAILURES_PER_ACTOR,
  TICKET_CODE_MAX_FAILURES_PER_OCCURRENCE,
  ticketCheckInWindow,
  ticketCodeVisibleFromMs,
} from '../utils/ticketCheckInWindow';
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
    private readonly qrTokenPort?: TicketQrTokenPort,
    private readonly now: () => number = () => Date.now()
  ) {}

  /** Prova de uso numa contestação: algum ingresso do pedido passou pelo check-in (D14). */
  async orderHasCheckIn(orderId: string): Promise<boolean> {
    const tickets = await this.port.listTicketsByOrderId(orderId);
    return tickets.some((ticket) => ticket.status === 'checked_in');
  }

  async generateTicketPresentationQr(
    actor: TicketingActorContext,
    ticketId: string
  ): Promise<{
    ticketId: string;
    token: string;
    expiresAt: string;
    /** Código de 8 caracteres junto do QR; null antes do dia da sessão (D20). */
    code: string | null;
    codeVisibleFrom: string | null;
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
    const nowMs = this.now();
    const nowSec = Math.floor(nowMs / 1000);
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

    const qrVersion = ticket.qrVersion || 1;
    const token = this.qrTokenPort.issue({
      v: 1,
      tid: ticket.id,
      occ: ticket.occurrenceId,
      qv: qrVersion,
      exp: expSec,
    });
    const codeVisibleFromMs = occurrence ? ticketCodeVisibleFromMs(occurrence.startsAt) : null;

    return {
      ticketId: ticket.id,
      token,
      expiresAt: new Date(expSec * 1000).toISOString(),
      code:
        codeVisibleFromMs !== null && nowMs >= codeVisibleFromMs
          ? deriveTicketCheckInCode(ticket.id, qrVersion)
          : null,
      codeVisibleFrom:
        codeVisibleFromMs === null ? null : new Date(codeVisibleFromMs).toISOString(),
    };
  }

  async checkInTicket(
    actor: TicketingActorContext,
    params: {
      occurrenceId: string;
      ticketId?: string;
      qrToken?: string;
      /** Código de 8 caracteres digitado na portaria quando o QR não lê (D20). */
      code?: string;
    }
  ): Promise<{ ticket: Ticket; checkIn: EventCheckIn }> {
    const { listing, occurrence } = await assertCanManageOccurrence(actor, params.occurrenceId);

    let targetTicketId = params.ticketId;
    if (!targetTicketId && params.code) {
      targetTicketId = await this.ticketIdFromCode(actor, occurrence, params.code);
    }
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
        if (verified.occ !== params.occurrenceId) {
          throw new TicketingDomainError(
            'UNPROCESSABLE_ENTITY',
            'Este ingresso pertence a outra sessão/ocorrência do evento.'
          );
        }
        const ticket = await this.port.getTicketById(verified.tid);
        if (!ticket) {
          throw new TicketingDomainError(
            'NOT_FOUND',
            'Ingresso não localizado para o QR Code informado.'
          );
        }
        if ((ticket.qrVersion || 1) !== verified.qv) {
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

  /**
   * Ingresso cujo código bate com o digitado, só para quem gerencia a sessão e na janela dela.
   * Errar demais trava o código, nunca o QR (D20, exceção do §7.7).
   */
  private async ticketIdFromCode(
    actor: TicketingActorContext,
    occurrence: { id: string; startsAt: string; endsAt: string },
    rawCode: string
  ): Promise<string> {
    const nowMs = this.now();
    const { opensAtMs, closesAtMs } = ticketCheckInWindow(occurrence.startsAt, occurrence.endsAt);
    if (nowMs < opensAtMs || nowMs > closesAtMs) {
      throw new TicketingDomainError(
        'UNPROCESSABLE_ENTITY',
        'O check-in por código desta sessão não está aberto agora.'
      );
    }
    const since = new Date(nowMs - TICKET_CODE_FAILURE_WINDOW_MS).toISOString();
    const [byActor, bySession] = await Promise.all([
      this.port.countCheckInCodeFailures(occurrence.id, since, actor.uid),
      this.port.countCheckInCodeFailures(occurrence.id, since),
    ]);
    if (
      byActor >= TICKET_CODE_MAX_FAILURES_PER_ACTOR ||
      bySession >= TICKET_CODE_MAX_FAILURES_PER_OCCURRENCE
    ) {
      throw new TicketingDomainError(
        'TOO_MANY_REQUESTS',
        'Muitos códigos errados. Leia o QR Code ou tente de novo em 15 minutos.'
      );
    }
    const code = normalizeTicketCheckInCode(rawCode);
    const tickets = code ? await this.port.listTicketsByOccurrenceId(occurrence.id) : [];
    const match = tickets.find(
      (ticket) =>
        (ticket.status === 'issued' || ticket.status === 'checked_in') &&
        code !== null &&
        ticketCheckInCodeMatches(ticket.id, ticket.qrVersion || 1, code)
    );
    if (!match) {
      await this.port.addCheckInCodeFailure(
        occurrence.id,
        actor.uid,
        new Date(nowMs).toISOString()
      );
      throw new TicketingDomainError('UNPROCESSABLE_ENTITY', 'Código incorreto.');
    }
    return match.id;
  }
}
