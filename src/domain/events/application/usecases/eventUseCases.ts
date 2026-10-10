import { eventsAdapter } from '../../factory';
import type {
  CreateEventListingInput,
  CreateEventOccurrenceInput,
  EventListing,
  EventOccurrence,
  UpdateEventListingInput,
} from '../../types/event';

export async function getEventListingByIdUseCase(id: string): Promise<EventListing | null> {
  return eventsAdapter.getEventListingById(id);
}

export async function listEventOccurrencesUseCase(
  eventListingId: string
): Promise<EventOccurrence[]> {
  return eventsAdapter.listEventOccurrences(eventListingId);
}

export async function createPartnerEventListingUseCase(
  input: CreateEventListingInput
): Promise<{ id: string; listing?: EventListing; occurrences?: EventOccurrence[] }> {
  return eventsAdapter.createPartnerEventListing(input);
}

export async function updatePartnerEventListingUseCase(
  id: string,
  input: UpdateEventListingInput
): Promise<void> {
  return eventsAdapter.updatePartnerEventListing(id, input);
}

export async function deletePartnerEventListingUseCase(id: string): Promise<void> {
  return eventsAdapter.deletePartnerEventListing(id);
}

export async function createPartnerEventOccurrenceUseCase(
  eventListingId: string,
  input: CreateEventOccurrenceInput
): Promise<EventOccurrence> {
  return eventsAdapter.createPartnerEventOccurrence(eventListingId, input);
}

export async function updatePartnerEventOccurrenceUseCase(
  eventListingId: string,
  occurrenceId: string,
  input: Partial<CreateEventOccurrenceInput>
): Promise<EventOccurrence> {
  return eventsAdapter.updatePartnerEventOccurrence(eventListingId, occurrenceId, input);
}

export async function deletePartnerEventOccurrenceUseCase(
  eventListingId: string,
  occurrenceId: string
): Promise<void> {
  return eventsAdapter.deletePartnerEventOccurrence(eventListingId, occurrenceId);
}

export async function createAdminEventListingUseCase(
  input: CreateEventListingInput
): Promise<{ id: string; listing?: EventListing; occurrences?: EventOccurrence[] }> {
  return eventsAdapter.createAdminEventListing(input);
}

export async function updateAdminEventListingUseCase(
  id: string,
  input: UpdateEventListingInput
): Promise<void> {
  return eventsAdapter.updateAdminEventListing(id, input);
}

export async function deleteAdminEventListingUseCase(id: string): Promise<void> {
  return eventsAdapter.deleteAdminEventListing(id);
}

export async function archiveAdminEventListingUseCase(id: string): Promise<void> {
  return eventsAdapter.archiveAdminEventListing(id);
}

export async function cancelAdminEventListingUseCase(id: string): Promise<void> {
  return eventsAdapter.cancelAdminEventListing(id);
}

export async function createAdminEventOccurrenceUseCase(
  eventListingId: string,
  input: CreateEventOccurrenceInput
): Promise<EventOccurrence> {
  return eventsAdapter.createAdminEventOccurrence(eventListingId, input);
}

export async function updateAdminEventOccurrenceUseCase(
  eventListingId: string,
  occurrenceId: string,
  input: Partial<CreateEventOccurrenceInput>
): Promise<EventOccurrence> {
  return eventsAdapter.updateAdminEventOccurrence(eventListingId, occurrenceId, input);
}

export async function deleteAdminEventOccurrenceUseCase(
  eventListingId: string,
  occurrenceId: string
): Promise<void> {
  return eventsAdapter.deleteAdminEventOccurrence(eventListingId, occurrenceId);
}
