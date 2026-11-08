import { TicketingDomainError } from '../errors/ticketingDomainError';
import type { TicketingPort } from '../ports/ticketingPort';
import type { TicketTransferLink } from '../types/ticketingTypes';
import { generateTransferLinkToken, transferLinkTokenMatches } from '../utils/transferLinkToken';
import type { TicketingActorContext } from './ticketingAccess';
import { loadTransferContext } from './transferEligibility';

/** O link vale 30 min (D21): pouco tempo, porque quem tiver o link pode pegar o ingresso. */
export const TRANSFER_LINK_TTL_MS = 30 * 60 * 1000;

export interface TransferLinkPreview {
  eventTitle: string | null;
  startsAt: string | null;
  ticketType: string | null;
  from: TicketTransferLink['receivedFrom'];
  expiresAt: string;
}

/** Link de transferência para quem ainda não tem conta (D21): uso único, 30 min, só quem comprou gera. */
export class TicketTransferLinkService {
  constructor(
    private readonly port: TicketingPort,
    private readonly now: () => number = () => Date.now()
  ) {}

  async create(
    actor: TicketingActorContext,
    ticketId: string,
    receivedFrom: TicketTransferLink['receivedFrom']
  ): Promise<{ linkId: string; token: string; expiresAt: string }> {
    const ticket = await this.port.getTicketById(ticketId);
    if (!ticket || ticket.ownerUserId !== actor.uid) {
      throw new TicketingDomainError('NOT_FOUND', 'Ingresso não encontrado.');
    }
    if (ticket.status !== 'issued') {
      throw new TicketingDomainError(
        'UNPROCESSABLE_ENTITY',
        'Apenas ingressos emitidos e não utilizados podem ser transferidos.'
      );
    }
    const nowMs = this.now();
    const { order } = await loadTransferContext(this.port, ticket, nowMs);
    if (order && order.buyerId !== ticket.ownerUserId) {
      throw new TicketingDomainError(
        'TRANSFER_ONLY_TO_BUYER',
        'Ingresso recebido só pode ser devolvido para quem comprou.'
      );
    }
    const { token, tokenHash } = generateTransferLinkToken();
    const link = await this.port.createTransferLink({
      ticketId,
      fromUserId: actor.uid,
      tokenHash,
      status: 'pending',
      expiresAt: new Date(nowMs + TRANSFER_LINK_TTL_MS).toISOString(),
      createdAt: new Date(nowMs).toISOString(),
      receivedFrom,
    });
    return { linkId: link.id, token, expiresAt: link.expiresAt };
  }

  async preview(linkId: string, token: string): Promise<TransferLinkPreview> {
    const link = await this.validLink(linkId, token);
    const ticket = await this.port.getTicketById(link.ticketId);
    return {
      eventTitle: ticket?.eventSnapshot?.title ?? null,
      startsAt: ticket?.eventSnapshot?.startsAt ?? null,
      ticketType: ticket?.ticketTypeSnapshot?.name ?? null,
      from: link.receivedFrom,
      expiresAt: link.expiresAt,
    };
  }

  /** Reserva o link para quem aceitou; a transferência vem em seguida (camada de aplicação). */
  async claim(linkId: string, token: string, acceptorUid: string): Promise<TicketTransferLink> {
    const link = await this.validLink(linkId, token);
    if (link.fromUserId === acceptorUid) {
      throw new TicketingDomainError(
        'TRANSFER_LINK_OWN',
        'Este link é seu: envie para outra pessoa.'
      );
    }
    return this.port.claimTransferLink(linkId, acceptorUid, new Date(this.now()).toISOString());
  }

  release(linkId: string): Promise<void> {
    return this.port.releaseTransferLink(linkId);
  }

  cancel(actor: TicketingActorContext, ticketId: string): Promise<void> {
    return this.port.cancelTransferLinksForTicket(ticketId, actor.uid);
  }

  // Link inexistente e código errado dão a mesma resposta: não revela quais links existem.
  private async validLink(linkId: string, token: string): Promise<TicketTransferLink> {
    const link = await this.port.getTransferLink(linkId);
    if (!link || !transferLinkTokenMatches(token, link.tokenHash)) {
      throw new TicketingDomainError('TRANSFER_LINK_INVALID', 'Link de transferência inválido.');
    }
    if (link.status !== 'pending') {
      throw new TicketingDomainError(
        'TRANSFER_LINK_INVALID',
        'Este link já foi usado ou cancelado.'
      );
    }
    if (new Date(link.expiresAt).getTime() <= this.now()) {
      throw new TicketingDomainError('TRANSFER_LINK_EXPIRED', 'Este link venceu.');
    }
    return link;
  }
}
