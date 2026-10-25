import {
  createEventAuditLogUseCase,
  getEventListingByIdUseCase,
  getEventOccurrenceByIdUseCase,
  updateEventListingPricingSummaryUseCase,
} from '../../events';
import { TicketingDomainError } from '../errors/ticketingDomainError';
import type { TicketingPort } from '../ports/ticketingPort';
import {
  assertMoneyMinor,
  deriveTicketTypeSaleStatus,
  type EventPromoCode,
  type PublicTicketTypeProjection,
  type TicketType,
} from '../types/ticketingTypes';
import {
  assertCanManageOccurrence,
  getAuditActorType,
  isActorAdmin,
  type TicketingActorContext,
} from './ticketingAccess';

/** Lotes de ingresso, cupons e o resumo de preço do evento. */
export class TicketTypeService {
  constructor(private readonly port: TicketingPort) {}

  private async refreshListingPricingSummary(
    eventListingId: string,
    occurrenceId: string
  ): Promise<void> {
    try {
      const types = await this.port.listTicketTypesByOccurrenceId(occurrenceId);
      const activeTypes = types.filter((t) => t.status !== 'archived');
      if (activeTypes.length === 0) return;

      const hasPaid = activeTypes.some((t) => t.priceMinor > 0);
      const paidPrices = activeTypes.filter((t) => t.priceMinor > 0).map((t) => t.priceMinor);
      const startingPriceMinor = paidPrices.length > 0 ? Math.min(...paidPrices) : 0;

      await updateEventListingPricingSummaryUseCase(eventListingId, {
        pricingMode: hasPaid ? 'paid' : 'free',
        startingPriceMinor,
      });
    } catch {
      // Ignora erro não-bloqueante de sumário
    }
  }

  async createTicketType(
    actor: TicketingActorContext,
    input: {
      occurrenceId: string;
      name: string;
      description?: string;
      kind: TicketType['kind'];
      priceMinor: number;
      currency?: 'BRL';
      quantity: number;
      minPerOrder?: number;
      maxPerOrder?: number;
      salesStartsAt?: string;
      salesEndsAt?: string;
      status?: TicketType['status'];
      visibility?: TicketType['visibility'];
      requiresEligibilityProof?: boolean;
      sortOrder?: number;
    }
  ): Promise<TicketType> {
    assertMoneyMinor(input.priceMinor);
    const { occurrence, listing } = await assertCanManageOccurrence(actor, input.occurrenceId);

    if (input.quantity > occurrence.capacity) {
      throw new TicketingDomainError(
        'UNPROCESSABLE_ENTITY',
        `A quantidade do lote (${input.quantity}) não pode exceder a capacidade da ocorrência (${occurrence.capacity}).`
      );
    }

    const created = await this.port.createTicketType({
      occurrenceId: input.occurrenceId,
      eventListingId: listing.id,
      name: input.name.trim(),
      description: input.description?.trim(),
      kind: input.kind,
      priceMinor: input.kind === 'free' || input.kind === 'courtesy' ? 0 : input.priceMinor,
      currency: 'BRL',
      quantity: input.quantity,
      minPerOrder: input.minPerOrder ?? 1,
      maxPerOrder: input.maxPerOrder ?? 10,
      salesStartsAt: input.salesStartsAt,
      salesEndsAt: input.salesEndsAt,
      status: input.status ?? 'on_sale',
      visibility: input.visibility ?? 'public',
      requiresEligibilityProof: input.requiresEligibilityProof,
      sortOrder: input.sortOrder ?? 0,
    });

    await this.refreshListingPricingSummary(listing.id, occurrence.id);

    await createEventAuditLogUseCase({
      actorId: actor.uid,
      actorType: getAuditActorType(actor, listing.ownerId),
      resourceType: 'ticketType',
      resourceId: created.id,
      action: 'ticket_type.created',
      after: {
        name: created.name,
        kind: created.kind,
        priceMinor: created.priceMinor,
        quantity: created.quantity,
      },
    });

    return created;
  }

  async updateTicketType(
    actor: TicketingActorContext,
    ticketTypeId: string,
    patch: Partial<
      Pick<
        TicketType,
        | 'name'
        | 'description'
        | 'priceMinor'
        | 'quantity'
        | 'minPerOrder'
        | 'maxPerOrder'
        | 'salesStartsAt'
        | 'salesEndsAt'
        | 'status'
        | 'visibility'
        | 'requiresEligibilityProof'
        | 'sortOrder'
      >
    >
  ): Promise<TicketType> {
    const existing = await this.port.getTicketTypeById(ticketTypeId);
    if (!existing) {
      throw new TicketingDomainError('NOT_FOUND', 'Lote de ingresso não encontrado.');
    }

    const { occurrence, listing } = await assertCanManageOccurrence(actor, existing.occurrenceId);

    const committed = existing.soldCount + existing.reservedCount;
    if (patch.quantity !== undefined) {
      if (patch.quantity < committed) {
        throw new TicketingDomainError(
          'UNPROCESSABLE_ENTITY',
          `Não é permitido reduzir a quantidade do lote (${patch.quantity}) abaixo dos ingressos já vendidos/reservados (${committed}).`
        );
      }
      if (patch.quantity > occurrence.capacity) {
        throw new TicketingDomainError(
          'UNPROCESSABLE_ENTITY',
          `A quantidade do lote não pode ultrapassar a capacidade da sessão (${occurrence.capacity}).`
        );
      }
    }

    if (
      patch.priceMinor !== undefined &&
      patch.priceMinor !== existing.priceMinor &&
      existing.soldCount > 0
    ) {
      throw new TicketingDomainError(
        'UNPROCESSABLE_ENTITY',
        'Não é permitido alterar o preço de um lote que já possui vendas confirmadas. Crie um novo lote.'
      );
    }

    const updated = await this.port.updateTicketType(ticketTypeId, patch);
    await this.refreshListingPricingSummary(listing.id, occurrence.id);

    await createEventAuditLogUseCase({
      actorId: actor.uid,
      actorType: getAuditActorType(actor, listing.ownerId),
      resourceType: 'ticketType',
      resourceId: updated.id,
      action: 'ticket_type.updated',
      before: {
        priceMinor: existing.priceMinor,
        quantity: existing.quantity,
        status: existing.status,
      },
      after: {
        priceMinor: updated.priceMinor,
        quantity: updated.quantity,
        status: updated.status,
      },
    });

    return updated;
  }

  async archiveOrDeleteTicketType(
    actor: TicketingActorContext,
    ticketTypeId: string
  ): Promise<{ mode: 'deleted' | 'archived' }> {
    const existing = await this.port.getTicketTypeById(ticketTypeId);
    if (!existing) {
      throw new TicketingDomainError('NOT_FOUND', 'Lote de ingresso não encontrado.');
    }
    const { occurrence, listing } = await assertCanManageOccurrence(actor, existing.occurrenceId);

    if (existing.soldCount > 0 || existing.reservedCount > 0) {
      await this.port.updateTicketType(ticketTypeId, { status: 'archived' });
      await this.refreshListingPricingSummary(listing.id, occurrence.id);
      return { mode: 'archived' };
    }

    await this.port.deleteTicketType(ticketTypeId);
    await this.refreshListingPricingSummary(listing.id, occurrence.id);
    return { mode: 'deleted' };
  }

  async listPublicTicketTypesByOccurrence(
    occurrenceId: string
  ): Promise<PublicTicketTypeProjection[]> {
    const occurrence = await getEventOccurrenceByIdUseCase(occurrenceId);
    if (!occurrence) {
      throw new TicketingDomainError('NOT_FOUND', 'Ocorrência do evento não encontrada.');
    }
    const listing = await getEventListingByIdUseCase(occurrence.eventListingId);
    if (listing?.status !== 'published' || listing.visibility === 'private') {
      throw new TicketingDomainError('NOT_FOUND', 'Evento indisponível para consulta pública.');
    }

    const types = await this.port.listTicketTypesByOccurrenceId(occurrenceId);
    const totalCommitted = types.reduce((sum, t) => sum + t.soldCount + t.reservedCount, 0);

    return types
      .filter((t) => t.visibility === 'public' && t.status !== 'archived' && t.status !== 'draft')
      .map((t) => {
        const { saleStatus, status, availableQuantity } = deriveTicketTypeSaleStatus({
          ticketType: t,
          occurrenceCapacity: occurrence.capacity,
          occurrenceCommittedCount: totalCommitted,
        });
        return {
          id: t.id,
          occurrenceId: t.occurrenceId,
          name: t.name,
          description: t.description,
          kind: t.priceMinor === 0 ? ('free' as const) : ('paid' as const),
          priceMinor: t.priceMinor,
          currency: 'BRL' as const,
          availableQuantity,
          minPerOrder: t.minPerOrder,
          maxPerOrder: t.maxPerOrder,
          salesStartsAt: t.salesStartsAt,
          salesEndsAt: t.salesEndsAt,
          requiresEligibilityProof: t.requiresEligibilityProof,
          sortOrder: t.sortOrder,
          status,
          saleStatus,
        };
      });
  }

  async listTicketTypesForManagement(
    actor: TicketingActorContext,
    occurrenceId: string
  ): Promise<TicketType[]> {
    await assertCanManageOccurrence(actor, occurrenceId);
    return this.port.listTicketTypesByOccurrenceId(occurrenceId);
  }

  async createPromoCode(
    actor: TicketingActorContext,
    input: {
      eventListingId: string;
      code: string;
      type: 'percentage' | 'fixed';
      valueMinor?: number;
      percentage?: number;
      maxUses?: number;
      startsAt?: string;
      endsAt?: string;
      ticketTypeIds?: string[];
      isActive?: boolean;
    }
  ): Promise<EventPromoCode> {
    const listing = await getEventListingByIdUseCase(input.eventListingId);
    if (!listing) {
      throw new TicketingDomainError('NOT_FOUND', 'Evento não encontrado.');
    }
    if (!isActorAdmin(actor) && listing.ownerId !== actor.uid) {
      throw new TicketingDomainError('FORBIDDEN', 'Sem permissão para criar cupons neste evento.');
    }

    return this.port.createPromoCode({
      eventListingId: input.eventListingId,
      code: input.code,
      type: input.type,
      valueMinor: input.valueMinor,
      percentage: input.percentage,
      maxUses: input.maxUses,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      ticketTypeIds: input.ticketTypeIds,
      isActive: input.isActive ?? true,
    });
  }
}
