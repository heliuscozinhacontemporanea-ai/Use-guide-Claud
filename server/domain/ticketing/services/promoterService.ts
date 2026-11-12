import { getEventListingByIdUseCase } from '../../events';
import { PromoterError } from '../errors/promoterError';
import { TicketingDomainError } from '../errors/ticketingDomainError';
import type { PromoterStorePort } from '../ports/promoterStorePort';
import type { TicketingPort } from '../ports/ticketingPort';
import {
  type EventPromoter,
  type PromoterEarning,
  type PromoterTotals,
  promoterCodeFromParam,
  promoterOwedMinor,
} from '../types/promoterTypes';
import { promoterSalesFromOrders } from '../utils/promoterSales';
import { isActorAdmin, type TicketingActorContext } from './ticketingAccess';

export interface PromoterRow extends PromoterTotals {
  id: string;
  eventListingId: string;
  promoter: EventPromoter['promoter'];
  code: string;
  earning: PromoterEarning;
  status: EventPromoter['status'];
  createdAt: string;
}

export interface EventPromotersSummary extends PromoterTotals {
  rows: PromoterRow[];
}

const MAX_BASIS_POINTS = 10_000;
const MAX_AMOUNT_MINOR = 100_000_000;

/**
 * Divulgadores (D27, opção A): convite pelo @, aceite, link com código fixo e a conta do que o
 * organizador deve a cada um. Nenhum dinheiro passa pela plataforma.
 */
export class PromoterService {
  constructor(
    private readonly store: PromoterStorePort,
    private readonly port: TicketingPort,
    private readonly now: () => number = () => Date.now()
  ) {}

  async invite(
    actor: TicketingActorContext,
    eventListingId: string,
    promoter: { uid: string; username: string | null; displayName: string | null },
    earning: PromoterEarning
  ): Promise<EventPromoter> {
    const listing = await this.assertOwner(actor, eventListingId);
    if (promoter.uid === listing.ownerId) {
      throw new PromoterError('PROMOTER_SELF', 'Você não pode ser divulgador do próprio evento.');
    }
    if (listing.status !== 'published') {
      throw new PromoterError('PROMOTER_EVENT_CLOSED', 'Só eventos publicados têm divulgadores.');
    }
    assertEarning(earning);
    return this.store.invite({
      eventListingId,
      ownerId: listing.ownerId,
      promoterUid: promoter.uid,
      promoter: { username: promoter.username, displayName: promoter.displayName },
      earning,
      status: 'invited',
      createdAt: new Date(this.now()).toISOString(),
      acceptedAt: null,
      declinedAt: null,
      endedAt: null,
    });
  }

  async respond(uid: string, id: string, accept: boolean): Promise<EventPromoter> {
    const promoter = await this.store.get(id);
    // 404 para quem não é o convidado: não revela convites de outra pessoa (§7.10, A01).
    if (!promoter || promoter.promoterUid !== uid) {
      throw new PromoterError('PROMOTER_NOT_FOUND', 'Convite não encontrado.');
    }
    const nowIso = new Date(this.now()).toISOString();
    return this.store.transition(
      id,
      ['invited'],
      accept ? { status: 'active', acceptedAt: nowIso } : { status: 'declined', declinedAt: nowIso }
    );
  }

  async end(actor: TicketingActorContext, id: string): Promise<EventPromoter> {
    const promoter = await this.store.get(id);
    if (!promoter) throw new PromoterError('PROMOTER_NOT_FOUND', 'Divulgador não encontrado.');
    await this.assertOwner(actor, promoter.eventListingId);
    return this.store.transition(id, ['invited', 'active'], {
      status: 'ended',
      endedAt: new Date(this.now()).toISOString(),
    });
  }

  /** Código do link na compra: só de divulgador ativo do evento, e nunca a própria compra. */
  async resolveForOrder(
    eventListingId: string,
    rawParam: string | undefined,
    buyerUid: string
  ): Promise<string | null> {
    const code = rawParam ? promoterCodeFromParam(rawParam) : null;
    if (!code) return null;
    const promoter = await this.store.findByCode(eventListingId, code).catch(() => null);
    if (promoter?.status !== 'active' || promoter.promoterUid === buyerUid) return null;
    return promoter.id;
  }

  /**
   * Evento do link curto `/e/<@>-<código>` (C6): só de divulgação ativa e de evento publicado. Com o
   * mesmo código em dois eventos, vale o do @ que veio no link.
   */
  async eventForLink(rawParam: string): Promise<string | null> {
    const code = promoterCodeFromParam(rawParam);
    if (!code) return null;
    const active = (await this.store.listByCode(code)).filter(
      (promoter) => promoter.status === 'active'
    );
    const username = rawParam.trim().slice(0, -(code.length + 1));
    const promoter =
      active.find((item) => item.promoter.username === username) ?? active[0] ?? null;
    if (!promoter) return null;
    const listing = await getEventListingByIdUseCase(promoter.eventListingId);
    return listing?.status === 'published' ? listing.id : null;
  }

  async eventSummary(
    actor: TicketingActorContext,
    eventListingId: string
  ): Promise<EventPromotersSummary> {
    await this.assertOwner(actor, eventListingId);
    const promoters = (await this.store.listByEvent(eventListingId)).filter(
      (promoter) => promoter.status !== 'declined'
    );
    const rows = await this.withTotals(eventListingId, promoters);
    rows.sort((a, b) => b.soldMinor - a.soldMinor || b.createdAt.localeCompare(a.createdAt));
    return {
      rows,
      tickets: rows.reduce((sum, row) => sum + row.tickets, 0),
      soldMinor: rows.reduce((sum, row) => sum + row.soldMinor, 0),
      owedMinor: rows.reduce((sum, row) => sum + row.owedMinor, 0),
    };
  }

  /** Divulgação do usuário (p26): convites abertos e links, com o que tem a receber. */
  async mine(uid: string): Promise<PromoterRow[]> {
    const promoters = (await this.store.listByPromoter(uid)).filter(
      (promoter) =>
        promoter.status === 'invited' || promoter.status === 'active' || promoter.status === 'ended'
    );
    const byEvent = new Map<string, EventPromoter[]>();
    for (const promoter of promoters) {
      byEvent.set(promoter.eventListingId, [
        ...(byEvent.get(promoter.eventListingId) ?? []),
        promoter,
      ]);
    }
    const rows = (
      await Promise.all(
        [...byEvent.entries()].map(([eventListingId, list]) =>
          this.withTotals(eventListingId, list)
        )
      )
    ).flat();
    return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  anonymizePromoter(uid: string): Promise<number> {
    return this.store.anonymizePromoter(uid);
  }

  private async withTotals(
    eventListingId: string,
    promoters: EventPromoter[]
  ): Promise<PromoterRow[]> {
    if (promoters.length === 0) return [];
    const [orders, tickets, refunds] = await Promise.all([
      this.port.listOrdersByEventListingId(eventListingId),
      this.port.listTicketsByEventListingId(eventListingId),
      this.port.listRefundsByEventListingId(eventListingId),
    ]);
    const sales = promoterSalesFromOrders(orders, tickets, refunds);
    return promoters.map((promoter) => {
      const sale = sales.get(promoter.id);
      const totals = {
        tickets: sale?.tickets ?? 0,
        soldMinor: sale?.netTicketsMinor ?? 0,
        owedMinor: 0,
      };
      // Convite ainda não aceito não deve nada, nem o cachê.
      totals.owedMinor = promoter.acceptedAt ? promoterOwedMinor(promoter.earning, totals) : 0;
      return {
        id: promoter.id,
        eventListingId,
        promoter: promoter.promoter,
        code: promoter.code,
        earning: promoter.earning,
        status: promoter.status,
        createdAt: promoter.createdAt,
        ...totals,
      };
    });
  }

  private async assertOwner(actor: TicketingActorContext, eventListingId: string) {
    const listing = await getEventListingByIdUseCase(eventListingId);
    if (!listing || (!isActorAdmin(actor) && listing.ownerId !== actor.uid)) {
      // 404 e não 403: não revela divulgadores de eventos de outra pessoa (§7.10, A01).
      throw new TicketingDomainError('NOT_FOUND', 'Evento não encontrado.');
    }
    return listing;
  }
}

function assertEarning(earning: PromoterEarning): void {
  const ok =
    earning.type === 'commission'
      ? Number.isInteger(earning.basisPoints) &&
        earning.basisPoints > 0 &&
        earning.basisPoints <= MAX_BASIS_POINTS
      : Number.isInteger(earning.amountMinor) &&
        earning.amountMinor > 0 &&
        earning.amountMinor <= MAX_AMOUNT_MINOR;
  if (!ok) throw new PromoterError('PROMOTER_INVALID_EARNING', 'Valor de ganho inválido.');
}
