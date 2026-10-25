import type { EventCancellationPolicy } from '../../../shared/utils/cancellationPolicy';

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

export type ServiceFeeMode = 'pass_to_buyer' | 'absorb';

/** Regras de venda do evento (D14): política da plataforma, taxa de serviço e transferência de ingresso. */
export interface EventSalesPolicy {
  cancellationPolicy: EventCancellationPolicy;
  serviceFeeMode: ServiceFeeMode;
  allowTicketTransfer: boolean;
  ticketTransferCutoffHours: number;
}

/** Igual ao padrão do backend (server/domain/events/types/eventTypes.ts), com teste de paridade. */
export const DEFAULT_EVENT_SALES_POLICY: EventSalesPolicy = {
  cancellationPolicy: 'flexible',
  serviceFeeMode: 'pass_to_buyer',
  allowTicketTransfer: true,
  ticketTransferCutoffHours: 4,
};

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
  phone?: string;
  websiteLink?: string;
  instagramLink?: string;
  bookingLink?: string;
  salesPolicy: EventSalesPolicy;
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
  salesPolicy?: EventSalesPolicy;
  maxTicketsPerUserPerOccurrence?: number;
  entryType?: 'pago' | 'gratuito';
  date?: string;
  endDate?: string;
  occurrences?: CreateEventOccurrenceInput[];
}

export type UpdateEventListingInput = Partial<CreateEventListingInput>;
