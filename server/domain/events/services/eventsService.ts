import {
  EventDomainError,
  EventNotFoundError,
  EventOwnershipError,
  OccurrenceNotFoundError,
} from '../errors/eventDomainError';
import type { EventsPort } from '../ports/eventsPort';
import {
  canTransitionOccurrenceStatus,
  type CreateEventListingInput,
  type CreateEventOccurrenceInput,
  type EventListing,
  type EventOccurrence,
  type EventRatingSummary,
  type UpdateEventListingInput,
  type UpdateEventOccurrenceInput,
} from '../types/eventTypes';

export interface EventActorContext {
  uid: string;
  admin?: boolean;
  role?: string;
}

export class EventsService {
  constructor(private readonly eventsPort: EventsPort) {}

  private assertCanManageListing(actor: EventActorContext, listing: EventListing): void {
    if (actor.admin === true) {
      return;
    }
    if (!actor.uid || listing.ownerId !== actor.uid) {
      throw new EventOwnershipError();
    }
  }

  private validateOccurrenceTiming(input: {
    startsAt: string;
    endsAt: string;
    capacity: number;
    salesStartsAt?: string;
    salesEndsAt?: string;
  }): void {
    if (!Number.isInteger(input.capacity) || input.capacity <= 0) {
      throw new EventDomainError(
        'INVALID_ARGUMENT',
        'A capacidade da ocorrência deve ser maior que zero.'
      );
    }
    const startMs = new Date(input.startsAt).getTime();
    const endMs = new Date(input.endsAt).getTime();
    if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) {
      throw new EventDomainError(
        'INVALID_ARGUMENT',
        'A data/hora de término deve ser posterior à data/hora de início.'
      );
    }
    if (input.salesStartsAt && input.salesEndsAt) {
      const salesStartMs = new Date(input.salesStartsAt).getTime();
      const salesEndMs = new Date(input.salesEndsAt).getTime();
      if (!Number.isFinite(salesStartMs) || !Number.isFinite(salesEndMs) || salesEndMs <= salesStartMs) {
        throw new EventDomainError(
          'INVALID_ARGUMENT',
          'O encerramento das vendas deve ser posterior ao início das vendas.'
        );
      }
    }
    if (input.salesEndsAt) {
      const salesEndMs = new Date(input.salesEndsAt).getTime();
      if (!Number.isFinite(salesEndMs) || salesEndMs > startMs) {
        throw new EventDomainError(
          'INVALID_ARGUMENT',
          'O encerramento das vendas não pode ultrapassar o início da ocorrência.'
        );
      }
    }
  }

  async createListing(
    actor: EventActorContext,
    input: Omit<CreateEventListingInput, 'ownerId'> & {
      occurrences?: Array<Omit<CreateEventOccurrenceInput, 'eventListingId'>>;
    }
  ): Promise<{ listing: EventListing; occurrences: EventOccurrence[] }> {
    if (!actor.uid) {
      throw new EventOwnershipError('Usuário não autenticado.');
    }

    const initialOccurrences =
      input.occurrences && input.occurrences.length > 0
        ? input.occurrences
        : input.date && input.endDate
          ? [
              {
                startsAt: input.date,
                endsAt: input.endDate,
                capacity: 100,
              },
            ]
          : [];

    for (const occ of initialOccurrences) {
      this.validateOccurrenceTiming(occ);
    }

    const firstOcc = initialOccurrences[0];
    const listing = await this.eventsPort.createListing({
      ...input,
      ownerId: actor.uid,
      partnerId: actor.admin ? input.partnerId : actor.uid,
      organizerId: input.organizerId || actor.uid,
      date: firstOcc?.startsAt || input.date,
      endDate: firstOcc?.endsAt || input.endDate,
    });

    const createdOccurrences: EventOccurrence[] = [];
    try {
      for (const occ of initialOccurrences) {
        const createdOcc = await this.eventsPort.createOccurrence({
          ...occ,
          eventListingId: listing.id,
        });
        createdOccurrences.push(createdOcc);
      }
    } catch (error) {
      for (const createdOcc of createdOccurrences) {
        try {
          await this.eventsPort.deleteOccurrence(createdOcc.id);
        } catch {
          // Ignora falha secundária de rollback
        }
      }
      await this.eventsPort.deleteListing(listing.id);
      throw error;
    }

    await this.eventsPort.createAuditLog({
      actorId: actor.uid,
      actorType: actor.admin ? 'admin' : 'partner',
      resourceType: 'event',
      resourceId: listing.id,
      action: 'event.created',
      after: { id: listing.id, title: listing.title, occurrencesCount: createdOccurrences.length },
    });

    return { listing, occurrences: createdOccurrences };
  }

  async getListingById(id: string): Promise<EventListing | null> {
    if (!id.trim()) {
      throw new EventDomainError('INVALID_ARGUMENT', 'ID do evento inválido.');
    }
    return this.eventsPort.getListingById(id);
  }

  async listPublicListings(): Promise<EventListing[]> {
    return this.eventsPort.listPublicListings();
  }

  async listAllListings(): Promise<EventListing[]> {
    return this.eventsPort.listAllListings();
  }

  async updateListing(
    actor: EventActorContext,
    id: string,
    input: UpdateEventListingInput,
    options?: { hasCommercialHistory?: boolean }
  ): Promise<EventListing> {
    const existing = await this.eventsPort.getListingById(id);
    if (!existing) {
      throw new EventNotFoundError();
    }
    this.assertCanManageListing(actor, existing);

    const safeInput: UpdateEventListingInput = { ...input };
    delete (safeInput as Record<string, unknown>).ownerId;
    delete (safeInput as Record<string, unknown>).ratingSummary;
    if (options?.hasCommercialHistory) {
      delete (safeInput as Record<string, unknown>).establishmentId;
    }

    const updated = await this.eventsPort.updateListing(id, safeInput);

    await this.eventsPort.createAuditLog({
      actorId: actor.uid,
      actorType: actor.admin ? 'admin' : 'partner',
      resourceType: 'event',
      resourceId: id,
      action: 'event.updated',
      before: { status: existing.status, title: existing.title, ownerId: existing.ownerId },
      after: { status: updated.status, title: updated.title, ownerId: updated.ownerId },
    });

    return updated;
  }

  async publishListing(actor: EventActorContext, id: string): Promise<EventListing> {
    return this.updateListing(actor, id, { status: 'published', isActive: true });
  }

  async pauseListing(actor: EventActorContext, id: string): Promise<EventListing> {
    return this.updateListing(actor, id, { status: 'paused', isActive: false });
  }

  async archiveListing(actor: EventActorContext, id: string): Promise<EventListing> {
    return this.updateListing(actor, id, { status: 'archived', isActive: false });
  }

  async deleteOrArchiveListing(
    actor: EventActorContext,
    id: string,
    hasCommercialHistory: boolean
  ): Promise<{ mode: 'deleted' | 'archived' }> {
    const existing = await this.eventsPort.getListingById(id);
    if (!existing) {
      throw new EventNotFoundError();
    }
    this.assertCanManageListing(actor, existing);

    if (hasCommercialHistory) {
      await this.eventsPort.updateListing(id, { status: 'archived', isActive: false });
      await this.eventsPort.createAuditLog({
        actorId: actor.uid,
        actorType: actor.admin ? 'admin' : 'partner',
        resourceType: 'event',
        resourceId: id,
        action: 'event.archived_due_to_commercial_history',
      });
      return { mode: 'archived' };
    }

    const occurrences = await this.eventsPort.listOccurrencesByListingId(id);
    for (const occ of occurrences) {
      await this.eventsPort.deleteOccurrence(occ.id);
    }
    await this.eventsPort.deleteListing(id);

    await this.eventsPort.createAuditLog({
      actorId: actor.uid,
      actorType: actor.admin ? 'admin' : 'partner',
      resourceType: 'event',
      resourceId: id,
      action: 'event.deleted',
    });

    return { mode: 'deleted' };
  }

  async duplicateListing(actor: EventActorContext, sourceEventId: string): Promise<EventListing> {
    const existing = await this.eventsPort.getListingById(sourceEventId);
    if (!existing) {
      throw new EventNotFoundError();
    }
    this.assertCanManageListing(actor, existing);

    return this.eventsPort.createListing({
      ownerId: actor.admin ? existing.ownerId : actor.uid,
      partnerId: existing.partnerId,
      establishmentId: existing.establishmentId,
      title: `${existing.title} (Cópia)`,
      name: `${existing.name} (Cópia)`,
      summary: existing.summary,
      description: existing.description,
      category: existing.category,
      eventCategory: existing.eventCategory,
      customCategory: existing.customCategory,
      coverImage: existing.coverImage,
      image: existing.image,
      images: existing.images,
      visibility: existing.visibility,
      status: 'draft',
      isActive: false,
      organizerId: existing.organizerId,
      location: existing.location,
      contact: existing.contact,
      refundPolicy: existing.refundPolicy,
      ageRestriction: existing.ageRestriction,
      entryType: existing.entryType,
      pricingMode: existing.pricingMode,
    });
  }

  async createOccurrence(
    actor: EventActorContext,
    input: CreateEventOccurrenceInput
  ): Promise<EventOccurrence> {
    const listing = await this.eventsPort.getListingById(input.eventListingId);
    if (!listing) {
      throw new EventNotFoundError();
    }
    this.assertCanManageListing(actor, listing);
    this.validateOccurrenceTiming(input);

    const occurrence = await this.eventsPort.createOccurrence(input);

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
    if (options?.publicOnly && (listing.status !== 'published' || listing.visibility !== 'public')) {
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
    this.assertCanManageListing(actor, listing);

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
    const nextSalesEnd = input.salesEndsAt ?? occurrence.salesEndsAt;

    this.validateOccurrenceTiming({
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
    this.assertCanManageListing(actor, listing);

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
    this.assertCanManageListing(actor, listing);

    if (!canTransitionOccurrenceStatus(occurrence.status, 'postponed')) {
      throw new EventDomainError(
        'UNPROCESSABLE_ENTITY',
        `Não é possível adiar uma ocorrência no status ${occurrence.status}.`
      );
    }

    this.validateOccurrenceTiming({
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
    this.assertCanManageListing(actor, listing);

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
    this.assertCanManageListing(actor, listing);

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

  async updateRatingSummary(eventListingId: string, summary: EventRatingSummary): Promise<void> {
    await this.eventsPort.updateRatingSummary(eventListingId, summary);
  }

  async updateOwnerVerification(
    ownerId: string,
    verification: {
      isVerified: boolean;
      verifiedUntil: string | null;
      verificationType: 'trial' | 'monthly' | 'semi-annual' | 'annual' | 'admin' | null;
      isVerificationSuspended: boolean;
    }
  ): Promise<void> {
    if (!ownerId || !ownerId.trim()) {
      throw new EventDomainError('INVALID_ARGUMENT', 'ID do proprietário inválido');
    }
    await this.eventsPort.updateVerificationByOwner(ownerId, verification);
  }

  async deleteListingsByOwner(ownerId: string): Promise<void> {
    if (!ownerId || !ownerId.trim()) {
      return;
    }
    await this.eventsPort.deleteListingsByOwner(ownerId);
  }

  async updateListingPricingSummary(
    eventListingId: string,
    summary: { pricingMode: 'free' | 'paid'; startingPriceMinor?: number }
  ): Promise<void> {
    await this.eventsPort.updateListing(eventListingId, {
      pricingMode: summary.pricingMode,
      entryType: summary.pricingMode === 'paid' ? 'pago' : 'gratuito',
      startingPriceMinor: summary.startingPriceMinor,
    });
  }

  async recordAuditLog(entry: {
    actorId: string;
    actorType: 'admin' | 'partner' | 'user' | 'system';
    resourceType: 'event' | 'occurrence' | 'ticketType' | 'order' | 'ticket' | 'refund';
    resourceId: string;
    action: string;
    reason?: string;
    before?: unknown;
    after?: unknown;
  }) {
    return this.eventsPort.createAuditLog(entry);
  }
}
