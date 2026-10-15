export type EventListingStatus = 'draft' | 'published' | 'paused' | 'archived';

export type EventVisibility = 'public' | 'unlisted' | 'private';

export interface EventRatingSummary {
  average: number;
  count: number;
}

export interface EventLocation {
  name?: string;
  address?: string;
  googleMapsLink?: string;
  latitude?: number;
  longitude?: number;
}

export interface EventRefundPolicy {
  allowBuyerCancellation: boolean;
  buyerCancellationWindowHours?: number;
  allowTicketTransfer: boolean;
  ticketTransferCutoffHours?: number;
  enabled?: boolean;
  cancellationWindowHours?: number;
}

export interface EventListing {
  id: string;
  ownerId: string;
  partnerId?: string;
  establishmentId?: string;
  title: string;
  name: string;
  summary?: string;
  description: string;
  category: string;
  eventCategory?: string;
  customCategory?: string;
  coverImage: string;
  image: string;
  images: string[];
  visibility: EventVisibility;
  status: EventListingStatus;
  isActive: boolean;
  organizerId: string;
  location: EventLocation;
  contact?: {
    phone?: string;
    website?: string;
    instagram?: string;
    booking?: string;
  };
  refundPolicy: EventRefundPolicy;
  maxTicketsPerUserPerOccurrence?: number;
  ageRestriction?: {
    minAge?: number;
    maxAge?: number;
  };
  ratingSummary?: EventRatingSummary;
  pricingMode?: 'free' | 'paid';
  entryType?: 'pago' | 'gratuito';
  startingPriceMinor?: number;
  date?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type EventOccurrenceStatus = 'scheduled' | 'postponed' | 'canceled' | 'completed';

export type EventOccurrenceSalesStatus = 'not_started' | 'on_sale' | 'closed' | 'sold_out';

export interface EventOccurrence {
  id: string;
  eventListingId: string;
  startsAt: string;
  endsAt: string;
  status: EventOccurrenceStatus;
  capacity: number;
  salesStartsAt?: string;
  salesEndsAt?: string;
  locationOverride?: EventLocation;
  cancellationReason?: string;
  postponementReason?: string;
  rescheduledToOccurrenceId?: string;
  rescheduledFromOccurrenceId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventOccurrenceInput {
  startsAt: string;
  endsAt: string;
  capacity: number;
  salesStartsAt?: string;
  salesEndsAt?: string;
  locationOverride?: EventLocation;
}

export interface CreateEventListingInput {
  title?: string;
  name: string;
  summary?: string;
  description: string;
  category?: string;
  eventCategory: string;
  customCategory?: string;
  establishmentId?: string;
  coverImage?: string;
  image: string;
  images: string[];
  visibility?: EventVisibility;
  status?: EventListingStatus;
  isActive?: boolean;
  location: EventLocation | string;
  address?: string;
  googleMapsLink?: string;
  phone?: string;
  websiteLink?: string;
  instagramLink?: string;
  bookingLink?: string;
  refundPolicy?: Partial<EventRefundPolicy>;
  maxTicketsPerUserPerOccurrence?: number;
  entryType?: 'pago' | 'gratuito';
  date?: string;
  endDate?: string;
  occurrences?: CreateEventOccurrenceInput[];
}

export type UpdateEventListingInput = Partial<CreateEventListingInput>;
