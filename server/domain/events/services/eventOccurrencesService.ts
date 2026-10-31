import {
  EventDomainError,
  EventNotFoundError,
  OccurrenceNotFoundError,
} from '../errors/eventDomainError';
import type { EventsPort } from '../ports/eventsPort';
import {
  canTransitionOccurrenceStatus,
  type CreateEventOccurrenceInput,
  type EventOccurrence,
  type UpdateEventOccurrenceInput,
} from '../types/eventTypes';
import {
  defaultSalesEndsAt,
  assertCanManageListing,
  type EventActorContext,
  validateOccurrenceTiming,
} from './eventAccess';

/** Sessões de um evento: criação, alteração, cancelamento, adiamento, conclusão e exclusão. */
export class EventOccurrencesService {
  constructor(private readonly eventsPort: EventsPort) {}

  async createOccurrence(
    actor: EventActorContext,
    input: CreateEventOccurrenceInput
  ): Promise<EventOccurrence> {
    const listing = await this.eventsPort.getListingById(input.eventListingId);
    if (!listing) {
      throw new EventNotFoundError();
    }
    assertCanManageListing(actor, listing);
    const withSalesEnd = {
      ...input,
      salesEndsAt: input.salesEndsAt ?? defaultSalesEndsAt(input.startsAt),
    };
    validateOccurrenceTiming(withSalesEnd);

    const occurrence = await this.eventsPort.createOccurrence(withSalesEnd);

    if (!listing.date) {
      await this.eventsPort.updateListing(listing.id, {
        date: occurrence.startsAt,
        endDate: occurrence.endsAt,
      });
    }

    await this.eventsPort.createAuditLog({
      actorId: actor.uid,
      actorType: actor.admin ? 'admin' : 'partner',
      resourceType: 'occurrence',
      resourceId: occurrence.id,
      action: 'occurrence.created',
      after: occurrence,
    });

    return occurrence;
  }

  async getOccurrenceById(occurrenceId: string): Promise<EventOccurrence | null> {
    return this.eventsPort.getOccurrenceById(occurrenceId);
  }

  async listOccurrencesByListingId(
    eventListingId: string,
    options?: { publicOnly?: boolean }
  ): Promise<EventOccurrence[]> {
    const listing = await this.eventsPort.getListingById(eventListingId);
    if (!listing) {
      return [];
    }
    if (
      options?.publicOnly &&
      (listing.status !== 'published' || listing.visibility !== 'public')
    ) {
      return [];
    }
    const occurrences = await this.eventsPort.listOccurrencesByListingId(eventListingId);
    if (options?.publicOnly) {
      return occurrences.filter((occ) => occ.status !== 'canceled');
    }
    return occurrences;
  }

  async updateOccurrence(
    actor: EventActorContext,
    occurrenceId: string,
    input: UpdateEventOccurrenceInput,
    committedTicketsCount = 0
  ): Promise<EventOccurrence> {
    const occurrence = await this.eventsPort.getOccurrenceById(occurrenceId);
    if (!occurrence) {
      throw new OccurrenceNotFoundError();
    }
    const listing = await this.eventsPort.getListingById(occurrence.eventListingId);
    if (!listing) {
      throw new EventNotFoundError();
    }
    assertCanManageListing(actor, listing);

    if (input.status && !canTransitionOccurrenceStatus(occurrence.status, input.status)) {
      throw new EventDomainError(
        'UNPROCESSABLE_ENTITY',
        `Transição de status inválida de ${occurrence.status} para ${input.status}.`
      );
    }

    if (input.capacity !== undefined && input.capacity < committedTicketsCount) {
      throw new EventDomainError(
        'UNPROCESSABLE_ENTITY',
        'A capacidade não pode ser reduzida abaixo da quantidade de ingressos vendidos ou reservados.'
      );
    }

    if (
      committedTicketsCount > 0 &&
      ((input.startsAt && input.startsAt !== occurrence.startsAt) ||
        (input.endsAt && input.endsAt !== occurrence.endsAt))
    ) {
      throw new EventDomainError(
        'UNPROCESSABLE_ENTITY',
        'Ocorrência com vendas ativas deve ser adiada/reagendada via operação de adiamento para preservar o histórico.'
      );
    }

    const nextStartsAt = input.startsAt || occurrence.startsAt;
    const nextEndsAt = input.endsAt || occurrence.endsAt;
    const nextCapacity = input.capacity ?? occurrence.capacity;
    const nextSalesStart = input.salesStartsAt ?? occurrence.salesStartsAt;
    // Fim das vendas no padrão acompanha o novo horário; escolhido pelo parceiro, fica como está.
    const followsDefault =
      !occurrence.salesEndsAt || occurrence.salesEndsAt === defaultSalesEndsAt(occurrence.startsAt);
    if (input.startsAt && !input.salesEndsAt && followsDefault) {
      input = { ...input, salesEndsAt: defaultSalesEndsAt(input.startsAt) };
    }
    const nextSalesEnd = input.salesEndsAt ?? occurrence.salesEndsAt;

    validateOccurrenceTiming({
      startsAt: nextStartsAt,
      endsAt: nextEndsAt,
      capacity: nextCapacity,
      salesStartsAt: nextSalesStart,
      salesEndsAt: nextSalesEnd,
    });

    const updated = await this.eventsPort.updateOccurrence(occurrenceId, input);

    await this.eventsPort.createAuditLog({
      actorId: actor.uid,
      actorType: actor.admin ? 'admin' : 'partner',
      resourceType: 'occurrence',
      resourceId: occurrenceId,
      action: 'occurrence.updated',
      before: occurrence,
      after: updated,
    });

    return updated;
  }

  async cancelOccurrence(
    actor: EventActorContext,
    occurrenceId: string,
    reason?: string
  ): Promise<EventOccurrence> {
    const occurrence = await this.eventsPort.getOccurrenceById(occurrenceId);
    if (!occurrence) {
      throw new OccurrenceNotFoundError();
    }
    const listing = await this.eventsPort.getListingById(occurrence.eventListingId);
    if (!listing) {
      throw new EventNotFoundError();
    }
    assertCanManageListing(actor, listing);

    if (!canTransitionOccurrenceStatus(occurrence.status, 'canceled')) {
      throw new EventDomainError(
        'UNPROCESSABLE_ENTITY',
        `Não é possível cancelar uma ocorrência no status ${occurrence.status}.`
      );
    }

    const updated = await this.eventsPort.updateOccurrence(occurrenceId, {
      status: 'canceled',
      cancellationReason: reason || 'Cancelado pela organização.',
    });

    await this.eventsPort.createAuditLog({
      actorId: actor.uid,
      actorType: actor.admin ? 'admin' : 'partner',
      resourceType: 'occurrence',
      resourceId: occurrenceId,
      action: 'occurrence.canceled',
      reason,
      before: occurrence,
      after: updated,
    });

    return updated;
  }

  async postponeOccurrence(
    actor: EventActorContext,
    occurrenceId: string,
    replacement: {
      startsAt: string;
      endsAt: string;
      salesStartsAt?: string;
      salesEndsAt?: string;
      reason: string;
    }
  ): Promise<{ postponedOccurrence: EventOccurrence; newOccurrence: EventOccurrence }> {
    const occurrence = await this.eventsPort.getOccurrenceById(occurrenceId);
    if (!occurrence) {
      throw new OccurrenceNotFoundError();
    }
    const listing = await this.eventsPort.getListingById(occurrence.eventListingId);
    if (!listing) {
      throw new EventNotFoundError();
    }
    assertCanManageListing(actor, listing);

    if (!canTransitionOccurrenceStatus(occurrence.status, 'postponed')) {
      throw new EventDomainError(
        'UNPROCESSABLE_ENTITY',
        `Não é possível adiar uma ocorrência no status ${occurrence.status}.`
      );
    }

    validateOccurrenceTiming({
      startsAt: replacement.startsAt,
      endsAt: replacement.endsAt,
      capacity: occurrence.capacity,
      salesStartsAt: replacement.salesStartsAt,
      salesEndsAt: replacement.salesEndsAt,
    });

    const newOccurrence = await this.eventsPort.createOccurrence({
      eventListingId: occurrence.eventListingId,
      startsAt: replacement.startsAt,
      endsAt: replacement.endsAt,
      capacity: occurrence.capacity,
      salesStartsAt: replacement.salesStartsAt,
      salesEndsAt: replacement.salesEndsAt,
      locationOverride: occurrence.locationOverride,
      rescheduledFromOccurrenceId: occurrence.id,
    });

    const postponedOccurrence = await this.eventsPort.updateOccurrence(occurrence.id, {
      status: 'postponed',
      postponementReason: replacement.reason,
      rescheduledToOccurrenceId: newOccurrence.id,
    });

    await this.eventsPort.createAuditLog({
      actorId: actor.uid,
      actorType: actor.admin ? 'admin' : 'partner',
      resourceType: 'occurrence',
      resourceId: occurrence.id,
      action: 'occurrence.postponed',
      reason: replacement.reason,
      before: occurrence,
      after: {
        postponedOccurrenceId: postponedOccurrence.id,
        newOccurrenceId: newOccurrence.id,
      },
    });

    return { postponedOccurrence, newOccurrence };
  }

  async completeOccurrence(
    actor: EventActorContext,
    occurrenceId: string
  ): Promise<EventOccurrence> {
    const occurrence = await this.eventsPort.getOccurrenceById(occurrenceId);
    if (!occurrence) {
      throw new OccurrenceNotFoundError();
    }
    const listing = await this.eventsPort.getListingById(occurrence.eventListingId);
    if (!listing) {
      throw new EventNotFoundError();
    }
    assertCanManageListing(actor, listing);

    if (!canTransitionOccurrenceStatus(occurrence.status, 'completed')) {
      throw new EventDomainError(
        'UNPROCESSABLE_ENTITY',
        `Não é possível concluir uma ocorrência no status ${occurrence.status}.`
      );
    }

    return this.eventsPort.updateOccurrence(occurrenceId, {
      status: 'completed',
    });
  }

  async deleteOccurrence(
    actor: EventActorContext,
    occurrenceId: string,
    hasCommercialHistory: boolean
  ): Promise<{ mode: 'deleted' | 'canceled' }> {
    const occurrence = await this.eventsPort.getOccurrenceById(occurrenceId);
    if (!occurrence) {
      throw new OccurrenceNotFoundError();
    }
    const listing = await this.eventsPort.getListingById(occurrence.eventListingId);
    if (!listing) {
      throw new EventNotFoundError();
    }
    assertCanManageListing(actor, listing);

    if (hasCommercialHistory) {
      await this.cancelOccurrence(
        actor,
        occurrenceId,
        'Cancelada por exclusão com histórico comercial.'
      );
      return { mode: 'canceled' };
    }

    await this.eventsPort.deleteOccurrence(occurrenceId);
    await this.eventsPort.createAuditLog({
      actorId: actor.uid,
      actorType: actor.admin ? 'admin' : 'partner',
      resourceType: 'occurrence',
      resourceId: occurrenceId,
      action: 'occurrence.deleted',
    });

    return { mode: 'deleted' };
  }
}
