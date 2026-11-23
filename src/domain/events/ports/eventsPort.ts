import type { CreateEventOccurrenceInput, EventListing, EventOccurrence } from '../types/event';

export interface EventsPort {
  getEventListingById(id: string): Promise<EventListing | null>;
  listEventOccurrences(eventListingId: string): Promise<EventOccurrence[]>;

  createPartnerEventOccurrence(
    eventListingId: string,
    input: CreateEventOccurrenceInput
  ): Promise<EventOccurrence>;
  updatePartnerEventOccurrence(
    eventListingId: string,
    occurrenceId: string,
    input: Partial<CreateEventOccurrenceInput>
  ): Promise<EventOccurrence>;
  deletePartnerEventOccurrence(eventListingId: string, occurrenceId: string): Promise<void>;
  cancelPartnerEventOccurrence(
    eventListingId: string,
    occurrenceId: string,
    reason: string
  ): Promise<void>;
  postponePartnerEventOccurrence(
    eventListingId: string,
    occurrenceId: string,
    replacement: { startsAt: string; endsAt: string; reason: string }
  ): Promise<void>;
}
