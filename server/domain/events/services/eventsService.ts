import {
  EventDomainError,
  EventNotFoundError,
  EventOwnershipError,
} from '../errors/eventDomainError';
import type { EventsPort } from '../ports/eventsPort';
import {
  type CreateEventListingInput,
  type CreateEventOccurrenceInput,
  type EventListing,
  type EventOccurrence,
  type EventRatingSummary,
  type UpdateEventListingInput,
} from '../types/eventTypes';
import {
  assertCanManageListing,
  type EventActorContext,
  validateOccurrenceTiming,
} from './eventAccess';

export type { EventActorContext } from './eventAccess';

/** Anúncios de evento: criação, edição, publicação, duplicação e exclusão. */
export class EventsService {
  constructor(private readonly eventsPort: EventsPort) {}

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
      validateOccurrenceTiming(occ);
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
    assertCanManageListing(actor, existing);

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
    assertCanManageListing(actor, existing);

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
    assertCanManageListing(actor, existing);

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
      phone: existing.phone,
      websiteLink: existing.websiteLink,
      instagramLink: existing.instagramLink,
      bookingLink: existing.bookingLink,
      refundPolicy: existing.refundPolicy,
      ageRestriction: existing.ageRestriction,
      entryType: existing.entryType,
      pricingMode: existing.pricingMode,
    });
  }

  async updateRatingSummary(eventListingId: string, summary: EventRatingSummary): Promise<void> {
    await this.eventsPort.updateRatingSummary(eventListingId, summary);
  }

  async updateEstablishmentVerification(
    establishmentId: string,
    verification: {
      isVerified: boolean;
      verifiedUntil: string | null;
      verificationType: 'trial' | 'monthly' | 'semi-annual' | 'annual' | 'admin' | null;
      isVerificationSuspended: boolean;
    }
  ): Promise<void> {
    if (!establishmentId?.trim()) {
      throw new EventDomainError('INVALID_ARGUMENT', 'ID do estabelecimento inválido');
    }
    await this.eventsPort.updateVerificationByEstablishment(establishmentId, verification);
  }

  async deleteListingsByOwner(ownerId: string): Promise<void> {
    if (!ownerId?.trim()) {
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
