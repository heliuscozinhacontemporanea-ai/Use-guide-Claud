import { getEventListingByIdUseCase, getEventOccurrenceByIdUseCase } from '../../events';
import { CourtesyError } from '../errors/courtesyError';
import { TicketingDomainError } from '../errors/ticketingDomainError';
import type { CourtesyStorePort } from '../ports/courtesyStorePort';
import type { TicketingPort } from '../ports/ticketingPort';
import type { CourtesyGuest, CourtesyTicketDraft, EventCourtesy } from '../types/courtesyTypes';
import { courtesyLinkTokenMatches, generateCourtesyLinkToken } from '../utils/courtesyLinkToken';
import { generateOpaqueTicketQrToken } from '../utils/qrToken';
import {
  assertCanManageOccurrence,
  isActorAdmin,
  type TicketingActorContext,
} from './ticketingAccess';

/** Quem recebe: @ e nome públicos, e nome e e-mail da conta para o ingresso (como na compra). */
export interface CourtesyRecipient extends CourtesyGuest {
  holderName: string;
  holderEmail: string;
}

export type CourtesyRowStatus =
  | 'checked_in'
  | 'in_wallet'
  | 'link_pending'
  | 'link_expired'
  | 'canceled';

export interface CourtesyRow {
  id: string;
  occurrenceId: string;
  channel: EventCourtesy['channel'];
  status: CourtesyRowStatus;
  guest: { username: string | null; displayName: string | null } | null;
  checkedInAt: string | null;
  linkExpiresAt: string | null;
  createdAt: string;
}

export interface CourtesyLinkPreview {
  eventListingId: string;
  establishmentId: string | null;
  ownerId: string;
  eventTitle: string;
  startsAt: string;
  locationName: string | null;
  expiresAt: string;
}

const LIST_LIMIT = 200;
// Pedidos que nunca foram pagos não contam como compra (D27, proteção 2).
const NOT_A_PURCHASE = new Set(['expired', 'payment_failed']);

/**
 * Cortesias (D27): uma por pessoa por evento, só para quem não comprou nem teve compra cancelada ou
 * reembolsada no evento, nominal e cancelável até a pessoa entrar.
 */
export class CourtesyService {
  constructor(
    private readonly store: CourtesyStorePort,
    private readonly port: TicketingPort,
    private readonly now: () => number = () => Date.now()
  ) {}

  async inviteByUsername(
    actor: TicketingActorContext,
    occurrenceId: string,
    recipient: CourtesyRecipient
  ): Promise<EventCourtesy> {
    const { listing, occurrence } = await assertCanManageOccurrence(actor, occurrenceId);
    // Pelo @ vale até o fim da sessão: o organizador pode convidar na porta.
    this.assertOpen(occurrence, occurrence.endsAt);
    await this.assertEligible(recipient.uid, listing);
    const nowIso = new Date(this.now()).toISOString();
    return this.store.issue({
      eventListingId: listing.id,
      occurrenceId: occurrence.id,
      occurrenceCapacity: occurrence.capacity,
      invitedBy: actor.uid,
      channel: 'username',
      guest: {
        uid: recipient.uid,
        username: recipient.username,
        displayName: recipient.displayName,
      },
      ticket: this.ticketDraft(listing, occurrence, recipient),
      linkTokenHash: null,
      linkExpiresAt: null,
      nowIso,
    });
  }

  async createLink(
    actor: TicketingActorContext,
    occurrenceId: string
  ): Promise<{ courtesyId: string; token: string; expiresAt: string }> {
    const { listing, occurrence } = await assertCanManageOccurrence(actor, occurrenceId);
    // O link vale até o início da sessão (D27) e segura o lugar até lá.
    this.assertOpen(occurrence, occurrence.startsAt);
    const { token, tokenHash } = generateCourtesyLinkToken();
    const courtesy = await this.store.issue({
      eventListingId: listing.id,
      occurrenceId: occurrence.id,
      occurrenceCapacity: occurrence.capacity,
      invitedBy: actor.uid,
      channel: 'link',
      guest: null,
      ticket: null,
      linkTokenHash: tokenHash,
      linkExpiresAt: occurrence.startsAt,
      nowIso: new Date(this.now()).toISOString(),
    });
    return { courtesyId: courtesy.id, token, expiresAt: occurrence.startsAt };
  }

  async preview(courtesyId: string, token: string): Promise<CourtesyLinkPreview> {
    const courtesy = await this.validLink(courtesyId, token);
    const [listing, occurrence] = await Promise.all([
      getEventListingByIdUseCase(courtesy.eventListingId),
      getEventOccurrenceByIdUseCase(courtesy.occurrenceId),
    ]);
    if (!listing || !occurrence) {
      throw new CourtesyError('COURTESY_LINK_INVALID', 'Convite inválido.');
    }
    return {
      eventListingId: listing.id,
      establishmentId: listing.establishmentId ?? null,
      ownerId: listing.ownerId,
      eventTitle: listing.title,
      startsAt: occurrence.startsAt,
      locationName: occurrence.locationOverride?.name || listing.location.name || null,
      expiresAt: courtesy.linkExpiresAt ?? occurrence.startsAt,
    };
  }

  async claim(
    courtesyId: string,
    token: string,
    recipient: CourtesyRecipient
  ): Promise<EventCourtesy> {
    const courtesy = await this.validLink(courtesyId, token);
    const [listing, occurrence] = await Promise.all([
      getEventListingByIdUseCase(courtesy.eventListingId),
      getEventOccurrenceByIdUseCase(courtesy.occurrenceId),
    ]);
    if (!listing || !occurrence) {
      throw new CourtesyError('COURTESY_LINK_INVALID', 'Convite inválido.');
    }
    this.assertOpen(occurrence, occurrence.startsAt);
    await this.assertEligible(recipient.uid, listing);
    return this.store.claimLink({
      courtesyId,
      guest: {
        uid: recipient.uid,
        username: recipient.username,
        displayName: recipient.displayName,
      },
      ticket: this.ticketDraft(listing, occurrence, recipient),
      nowIso: new Date(this.now()).toISOString(),
    });
  }

  async cancel(actor: TicketingActorContext, courtesyId: string): Promise<EventCourtesy> {
    const courtesy = await this.store.get(courtesyId);
    if (!courtesy) throw new CourtesyError('COURTESY_NOT_FOUND', 'Cortesia não encontrada.');
    await this.assertCanManageListing(actor, courtesy.eventListingId);
    return this.store.cancel(courtesyId, new Date(this.now()).toISOString());
  }

  async listForEvent(actor: TicketingActorContext, eventListingId: string): Promise<CourtesyRow[]> {
    await this.assertCanManageListing(actor, eventListingId);
    const courtesies = await this.store.listByEvent(eventListingId, LIST_LIMIT);
    const tickets = await Promise.all(
      courtesies.map((courtesy) =>
        courtesy.ticketId ? this.port.getTicketById(courtesy.ticketId) : Promise.resolve(null)
      )
    );
    const nowMs = this.now();
    return courtesies.map((courtesy, index) => {
      const ticket = tickets[index];
      return {
        id: courtesy.id,
        occurrenceId: courtesy.occurrenceId,
        channel: courtesy.channel,
        status: rowStatus(courtesy, ticket?.status ?? null, nowMs),
        guest: courtesy.guest
          ? { username: courtesy.guest.username, displayName: courtesy.guest.displayName }
          : null,
        checkedInAt: ticket?.status === 'checked_in' ? (ticket.checkedInAt ?? null) : null,
        linkExpiresAt: courtesy.linkExpiresAt,
        createdAt: courtesy.createdAt,
      };
    });
  }

  /** Sessão cancelada: cancela as cortesias dela e devolve as que tinham pessoa, para o aviso. */
  async cancelAllForOccurrence(
    actor: TicketingActorContext,
    occurrenceId: string
  ): Promise<EventCourtesy[]> {
    const occurrence = await getEventOccurrenceByIdUseCase(occurrenceId);
    if (!occurrence) return [];
    await this.assertCanManageListing(actor, occurrence.eventListingId);
    const courtesies = await this.store.listByEvent(occurrence.eventListingId, LIST_LIMIT);
    const nowIso = new Date(this.now()).toISOString();
    const canceled: EventCourtesy[] = [];
    for (const courtesy of courtesies) {
      if (courtesy.occurrenceId !== occurrenceId || courtesy.status === 'canceled') continue;
      // Quem já entrou fica como está; o resto não pode travar o cancelamento da sessão.
      const result = await this.store.cancel(courtesy.id, nowIso).catch(() => null);
      if (result?.guest) canceled.push(result);
    }
    return canceled;
  }

  countHeld(occurrenceId: string): Promise<number> {
    return this.store.countHeldByOccurrence(occurrenceId);
  }

  anonymizeGuest(uid: string): Promise<number> {
    return this.store.anonymizeGuest(uid);
  }

  private assertOpen(occurrence: { status: string; startsAt: string }, untilIso: string): void {
    if (occurrence.status !== 'scheduled' || new Date(untilIso).getTime() <= this.now()) {
      throw new CourtesyError('COURTESY_SESSION_CLOSED', 'Esta sessão não aceita mais cortesias.');
    }
  }

  /** Proteções 1 e 2 da D27: o organizador não se convida e quem comprou o evento não ganha. */
  private async assertEligible(uid: string, listing: { id: string; ownerId: string }) {
    if (uid === listing.ownerId) {
      throw new CourtesyError('COURTESY_SELF', 'Você não pode se convidar.');
    }
    const [orders, tickets] = await Promise.all([
      this.port.listOrdersByBuyerId(uid),
      this.port.listTicketsByOwnerUserId(uid),
    ]);
    const bought = orders.some(
      (order) => order.eventListingId === listing.id && !NOT_A_PURCHASE.has(order.status)
    );
    // Ingresso pago recebido de outra pessoa também conta: a pessoa já tem lugar no evento.
    const holds = tickets.some(
      (ticket) =>
        ticket.eventListingId === listing.id &&
        !ticket.courtesyId &&
        (ticket.status === 'issued' || ticket.status === 'checked_in')
    );
    if (bought || holds) {
      throw new CourtesyError(
        'COURTESY_GUEST_HAS_PURCHASE',
        'Quem comprou ingresso deste evento não pode receber cortesia dele.'
      );
    }
  }

  private async assertCanManageListing(actor: TicketingActorContext, eventListingId: string) {
    const listing = await getEventListingByIdUseCase(eventListingId);
    if (!listing) throw new TicketingDomainError('NOT_FOUND', 'Evento não encontrado.');
    if (!isActorAdmin(actor) && listing.ownerId !== actor.uid) {
      // 404 e não 403: não revela cortesias de eventos de outra pessoa (§7.10, A01).
      throw new TicketingDomainError('NOT_FOUND', 'Evento não encontrado.');
    }
    return listing;
  }

  private ticketDraft(
    listing: { title: string; location: { name?: string } },
    occurrence: { startsAt: string; endsAt: string; locationOverride?: { name?: string } },
    recipient: CourtesyRecipient
  ): CourtesyTicketDraft {
    const { qrTokenHash } = generateOpaqueTicketQrToken();
    const locationName = occurrence.locationOverride?.name || listing.location.name;
    return {
      holderName: recipient.holderName,
      holderEmail: recipient.holderEmail,
      qrTokenHash,
      eventSnapshot: {
        title: listing.title,
        startsAt: occurrence.startsAt,
        endsAt: occurrence.endsAt,
        ...(locationName ? { locationName } : {}),
      },
    };
  }

  private async validLink(courtesyId: string, token: string): Promise<EventCourtesy> {
    const courtesy = await this.store.get(courtesyId);
    if (
      courtesy?.status !== 'pending_link' ||
      !courtesy.linkTokenHash ||
      !courtesyLinkTokenMatches(token, courtesy.linkTokenHash)
    ) {
      throw new CourtesyError('COURTESY_LINK_INVALID', 'Este convite já foi usado ou cancelado.');
    }
    if (courtesy.linkExpiresAt && new Date(courtesy.linkExpiresAt).getTime() <= this.now()) {
      throw new CourtesyError('COURTESY_LINK_EXPIRED', 'Este convite venceu.');
    }
    return courtesy;
  }
}

function rowStatus(
  courtesy: EventCourtesy,
  ticketStatus: string | null,
  nowMs: number
): CourtesyRowStatus {
  if (courtesy.status === 'canceled') return 'canceled';
  if (courtesy.status === 'pending_link') {
    return courtesy.linkExpiresAt && new Date(courtesy.linkExpiresAt).getTime() <= nowMs
      ? 'link_expired'
      : 'link_pending';
  }
  return ticketStatus === 'checked_in' ? 'checked_in' : 'in_wallet';
}
