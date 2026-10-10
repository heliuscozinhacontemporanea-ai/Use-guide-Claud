import type {
  CreateEventListingInput,
  CreateEventOccurrenceInput,
  EventAuditLog,
  EventListing,
  EventOccurrence,
  EventRatingSummary,
  UpdateEventListingInput,
  UpdateEventOccurrenceInput,
} from '../types/eventTypes';

export interface EventsPort {
  createListing(input: CreateEventListingInput): Promise<EventListing>;
  getListingById(id: string): Promise<EventListing | null>;
  listPublicListings(): Promise<EventListing[]>;
  listAllListings(): Promise<EventListing[]>;
  updateListing(id: string, input: UpdateEventListingInput): Promise<EventListing>;
  deleteListing(id: string): Promise<void>;
  updateRatingSummary(id: string, summary: EventRatingSummary): Promise<void>;
  updateVerificationByOwner(
    ownerId: string,
    verification: {
      isVerified: boolean;
      verifiedUntil: string | null;
      verificationType: 'trial' | 'monthly' | 'semi-annual' | 'annual' | null;
      isVerificationSuspended: boolean;
    }
  ): Promise<void>;
  deleteListingsByOwner(ownerId: string): Promise<void>;

  createOccurrence(input: CreateEventOccurrenceInput): Promise<EventOccurrence>;
  getOccurrenceById(occurrenceId: string): Promise<EventOccurrence | null>;
  listOccurrencesByListingId(eventListingId: string): Promise<EventOccurrence[]>;
  updateOccurrence(
    occurrenceId: string,
    input: UpdateEventOccurrenceInput
  ): Promise<EventOccurrence>;
  deleteOccurrence(occurrenceId: string): Promise<void>;

  createAuditLog(entry: Omit<EventAuditLog, 'id' | 'createdAt'>): Promise<EventAuditLog>;
}
