import {
  PlatformFeeConfigError,
  resolvePlatformFeeConfig,
} from '../../../shared/kernel/platformFees';
import {
  createEventAuditLogUseCase,
  getEventListingByIdUseCase,
  getEventOccurrenceByIdUseCase,
  listEventOccurrencesUseCase,
  updateEventListingPricingSummaryUseCase,
} from '../../events';
import { TicketingDomainError } from '../errors/ticketingDomainError';
import type { TicketingPort } from '../ports/ticketingPort';
import { isCourtesyTicketTypeId } from '../types/courtesyTypes';
import {
  assertMoneyMinor,
  deriveTicketTypeSaleStatus,
  type PublicTicketTypeProjection,
  type TicketType,
} from '../types/ticketingTypes';
import {
  assertCanManageOccurrence,
  getAuditActorType,
  type TicketingActorContext,
} from './ticketingAccess';
import { isUseGuideOwner } from '../../../shared/kernel/useGuideOwner';
import { eventCardSummary } from '../utils/eventCardSummary';

/** Lotes de ingresso, cupons e o resumo de preço do evento. */
export class TicketTypeService {
  constructor(private readonly port: TicketingPort) {}

  /**
   * Grátis ou pago e o "a partir de" do cartão do evento (D37 item 10), por todas as sessões que vêm.
   * Sem as taxas configuradas, o cartão fica sem preço em vez de mostrar um valor sem a taxa.
   */
  async refreshListingPricingSummary(eventListingId: string): Promise<void> {
    const listing = await getEventListingByIdUseCase(eventListingId);
    if (!listing) return;
    const occurrences = await listEventOccurrencesUseCase(eventListingId);
    const typesByOccurrence = new Map<string, TicketType[]>();
    for (const occurrence of occurrences) {
      typesByOccurrence.set(
        occurrence.id,
        await this.port.listTicketTypesByOccurrenceId(occurrence.id)
      );
    }
    const activeTypes = [...typesByOccurrence.values()]
      .flat()
      .filter((type) => type.status !== 'archived');
    if (activeTypes.length === 0) return;
    let ticketServiceFeeMinor: number | null = null;
    try {
      ticketServiceFeeMinor = resolvePlatformFeeConfig().ticketServiceFeeMinor;
    } catch (error) {
      if (!(error instanceof PlatformFeeConfigError)) throw error;
      console.error('[ticketing] taxas da plataforma não configuradas', { message: error.message });
    }
    const cardSummary =
      ticketServiceFeeMinor === null
        ? null
        : eventCardSummary({
            occurrences,
            typesByOccurrence,
            serviceFeeMode: listing.salesPolicy.serviceFeeMode,
            cancellationPolicy: listing.salesPolicy.cancellationPolicy,
            ticketServiceFeeMinor,
            nowMs: Date.now(),
          });
    await updateEventListingPricingSummaryUseCase(eventListingId, {
      pricingMode: activeTypes.some((type) => type.priceMinor > 0) ? 'paid' : 'free',
      cardSummary,
    });
  }

  /** A mudança no lote já valeu: falha no resumo do cartão só vai para o log. */
  private async refreshCardQuietly(eventListingId: string): Promise<void> {
    try {
      await this.refreshListingPricingSummary(eventListingId);
    } catch (error) {
      console.error('[ticketing] resumo do cartão não atualizado', {
        eventListingId,
        message: error instanceof Error ? error.message : String(error),
      });
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
    // Evento do Use Guide não vende ingresso pelo app (escolhas da F4): gratuito ou pago no local.
    if (isUseGuideOwner(listing.ownerId)) {
      throw new TicketingDomainError(
        'UNPROCESSABLE_ENTITY',
        'Evento do Use Guide não vende ingresso pelo app.'
      );
    }

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

    await this.refreshCardQuietly(listing.id);

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
        | 'status'
        | 'visibility'
        | 'requiresEligibilityProof'
        | 'sortOrder'
      >
    > & {
      /** `null` tira a data de início ou de fim das vendas. */
      salesStartsAt?: string | null;
      salesEndsAt?: string | null;
    }
  ): Promise<TicketType> {
    const existing = await this.port.getTicketTypeById(ticketTypeId);
    // O lote das cortesias é do sistema (D27): o organizador não edita nem arquiva.
    if (!existing || isCourtesyTicketTypeId(existing.id)) {
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

    const startsAt =
      patch.salesStartsAt === undefined ? existing.salesStartsAt : patch.salesStartsAt;
    const endsAt = patch.salesEndsAt === undefined ? existing.salesEndsAt : patch.salesEndsAt;
    if (startsAt && endsAt && new Date(endsAt).getTime() <= new Date(startsAt).getTime()) {
      throw new TicketingDomainError(
        'UNPROCESSABLE_ENTITY',
        'O fim das vendas precisa ser depois do início.'
      );
    }

    // O `null` vai gravado: a leitura só aceita texto, então a data some do lote.
    const updated = await this.port.updateTicketType(ticketTypeId, patch as Partial<TicketType>);
    await this.refreshCardQuietly(listing.id);

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
    // O lote das cortesias é do sistema (D27): o organizador não edita nem arquiva.
    if (!existing || isCourtesyTicketTypeId(existing.id)) {
      throw new TicketingDomainError('NOT_FOUND', 'Lote de ingresso não encontrado.');
    }
    const { listing } = await assertCanManageOccurrence(actor, existing.occurrenceId);

    if (existing.soldCount > 0 || existing.reservedCount > 0) {
      await this.port.updateTicketType(ticketTypeId, { status: 'archived' });
      await this.refreshCardQuietly(listing.id);
      return { mode: 'archived' };
    }

    await this.port.deleteTicketType(ticketTypeId);
    await this.refreshCardQuietly(listing.id);
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
    const types = await this.port.listTicketTypesByOccurrenceId(occurrenceId);
    return types.filter((type) => !isCourtesyTicketTypeId(type.id));
  }
}
