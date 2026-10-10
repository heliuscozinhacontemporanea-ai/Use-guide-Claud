import { eventsService } from '../factory';
import type { EventActorContext } from '../services/eventsService';
import type {
  CreateEventListingInput,
  CreateEventOccurrenceInput,
  EventListing,
  EventOccurrence,
  EventRatingSummary,
  UpdateEventListingInput,
  UpdateEventOccurrenceInput,
} from '../types/eventTypes';

export async function createEventListingUseCase(
  actor: EventActorContext,
  input: Omit<CreateEventListingInput, 'ownerId'> & {
    occurrences?: Array<Omit<CreateEventOccurrenceInput, 'eventListingId'>>;
  }
): Promise<{ listing: EventListing; occurrences: EventOccurrence[] }> {
  return eventsService.createListing(actor, input);
}

export async function getEventListingByIdUseCase(id: string): Promise<EventListing | null> {
  return eventsService.getListingById(id);
}

export async function listPublicEventListingsUseCase(): Promise<EventListing[]> {
  return eventsService.listPublicListings();
}

export async function listAllEventListingsUseCase(): Promise<EventListing[]> {
  return eventsService.listAllListings();
}

export async function updateEventListingUseCase(
  actor: EventActorContext,
  id: string,
  input: UpdateEventListingInput,
  options?: { hasCommercialHistory?: boolean }
): Promise<EventListing> {
  return eventsService.updateListing(actor, id, input, options);
}

export async function publishEventListingUseCase(
  actor: EventActorContext,
  id: string
): Promise<EventListing> {
  return eventsService.publishListing(actor, id);
}

export async function pauseEventListingUseCase(
  actor: EventActorContext,
  id: string
): Promise<EventListing> {
  return eventsService.pauseListing(actor, id);
}

export async function archiveEventListingUseCase(
  actor: EventActorContext,
  id: string
): Promise<EventListing> {
  return eventsService.archiveListing(actor, id);
}

export async function deleteOrArchiveEventListingUseCase(
  actor: EventActorContext,
  id: string,
  hasCommercialHistory = false
): Promise<{ mode: 'deleted' | 'archived' }> {
  return eventsService.deleteOrArchiveListing(actor, id, hasCommercialHistory);
}

export async function duplicateEventListingUseCase(
  actor: EventActorContext,
  sourceEventId: string
): Promise<EventListing> {
  return eventsService.duplicateListing(actor, sourceEventId);
}

export async function createEventOccurrenceUseCase(
  actor: EventActorContext,
  input: CreateEventOccurrenceInput
): Promise<EventOccurrence> {
  return eventsService.createOccurrence(actor, input);
}

export async function getEventOccurrenceByIdUseCase(
  occurrenceId: string
): Promise<EventOccurrence | null> {
  return eventsService.getOccurrenceById(occurrenceId);
}

export async function listEventOccurrencesUseCase(
  eventListingId: string,
  options?: { publicOnly?: boolean }
): Promise<EventOccurrence[]> {
  return eventsService.listOccurrencesByListingId(eventListingId, options);
}

export async function updateEventOccurrenceUseCase(
  actor: EventActorContext,
  occurrenceId: string,
  input: UpdateEventOccurrenceInput,
  committedTicketsCount = 0
): Promise<EventOccurrence> {
  return eventsService.updateOccurrence(actor, occurrenceId, input, committedTicketsCount);
}

export async function cancelEventOccurrenceUseCase(
  actor: EventActorContext,
  occurrenceId: string,
  reason?: string
): Promise<EventOccurrence> {
  return eventsService.cancelOccurrence(actor, occurrenceId, reason);
}

export async function postponeEventOccurrenceUseCase(
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
  return eventsService.postponeOccurrence(actor, occurrenceId, replacement);
}

export async function completeEventOccurrenceUseCase(
  actor: EventActorContext,
  occurrenceId: string
): Promise<EventOccurrence> {
  return eventsService.completeOccurrence(actor, occurrenceId);
}

export async function deleteEventOccurrenceUseCase(
  actor: EventActorContext,
  occurrenceId: string,
  hasCommercialHistory = false
): Promise<{ mode: 'deleted' | 'canceled' }> {
  return eventsService.deleteOccurrence(actor, occurrenceId, hasCommercialHistory);
}

export async function updateEventRatingSummaryUseCase(
  eventListingId: string,
  summary: EventRatingSummary
): Promise<void> {
  return eventsService.updateRatingSummary(eventListingId, summary);
}

export async function updateEventsOwnerVerificationUseCase(
  ownerId: string,
  verification: {
    isVerified: boolean;
    verifiedUntil: string | null;
    verificationType: 'trial' | 'monthly' | 'semi-annual' | 'annual' | null;
    isVerificationSuspended: boolean;
  }
): Promise<void> {
  return eventsService.updateOwnerVerification(ownerId, verification);
}

export async function deleteEventsByOwnerUseCase(ownerId: string): Promise<void> {
  return eventsService.deleteListingsByOwner(ownerId);
}

export async function updateEventListingPricingSummaryUseCase(
  eventListingId: string,
  summary: { pricingMode: 'free' | 'paid'; startingPriceMinor?: number }
): Promise<void> {
  return eventsService.updateListingPricingSummary(eventListingId, summary);
}

export async function recordEventAuditLogUseCase(entry: {
  actorId: string;
  actorType: 'admin' | 'partner' | 'user' | 'system';
  resourceType: 'event' | 'occurrence' | 'ticketType' | 'order' | 'ticket' | 'refund';
  resourceId: string;
  action: string;
  reason?: string;
  before?: unknown;
  after?: unknown;
}) {
  return eventsService.recordAuditLog(entry);
}

export const createEventAuditLogUseCase = recordEventAuditLogUseCase;
