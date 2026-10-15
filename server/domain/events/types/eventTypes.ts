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
  refundPolicy: {
    enabled: boolean;
    cancellationWindowHours?: number;
    allowBuyerCancellation?: boolean;
    buyerCancellationWindowHours?: number;
    allowTicketTransfer?: boolean;
    ticketTransferCutoffHours?: number;
  };
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

export interface EventAuditLog {
  id: string;
  actorId: string;
  actorType: 'admin' | 'partner' | 'user' | 'system';
  resourceType: 'event' | 'occurrence' | 'ticketType' | 'order' | 'ticket' | 'refund';
  resourceId: string;
  action: string;
  reason?: string;
  before?: unknown;
  after?: unknown;
  createdAt: string;
}

export interface CreateEventListingInput {
  ownerId: string;
  partnerId?: string;
  establishmentId?: string;
  title?: string;
  name?: string;
  summary?: string;
  description: string;
  category?: string;
  eventCategory?: string;
  customCategory?: string;
  coverImage?: string;
  image?: string;
  images: string[];
  visibility?: EventVisibility;
  status?: EventListingStatus;
  isActive?: boolean;
  organizerId?: string;
  location: EventLocation | string;
  address?: string;
  googleMapsLink?: string;
  phone?: string;
  websiteLink?: string;
  instagramLink?: string;
  bookingLink?: string;
  contact?: {
    phone?: string;
    website?: string;
    instagram?: string;
    booking?: string;
  };
  refundPolicy?: {
    enabled: boolean;
    cancellationWindowHours?: number;
    allowBuyerCancellation?: boolean;
    buyerCancellationWindowHours?: number;
    allowTicketTransfer?: boolean;
    ticketTransferCutoffHours?: number;
  };
  maxTicketsPerUserPerOccurrence?: number;
  ageRestriction?: {
    minAge?: number;
    maxAge?: number;
  };
  entryType?: 'pago' | 'gratuito';
  pricingMode?: 'free' | 'paid';
  startingPriceMinor?: number;
  date?: string;
  endDate?: string;
}

export interface UpdateEventListingInput {
  title?: string;
  name?: string;
  summary?: string;
  description?: string;
  category?: string;
  eventCategory?: string;
  customCategory?: string;
  coverImage?: string;
  image?: string;
  images?: string[];
  visibility?: EventVisibility;
  status?: EventListingStatus;
  isActive?: boolean;
  location?: EventLocation | string;
  address?: string;
  googleMapsLink?: string;
  phone?: string;
  websiteLink?: string;
  instagramLink?: string;
  bookingLink?: string;
  contact?: {
    phone?: string;
    website?: string;
    instagram?: string;
    booking?: string;
  };
  refundPolicy?: {
    enabled: boolean;
    cancellationWindowHours?: number;
    allowBuyerCancellation?: boolean;
    buyerCancellationWindowHours?: number;
    allowTicketTransfer?: boolean;
    ticketTransferCutoffHours?: number;
  };
  maxTicketsPerUserPerOccurrence?: number;
  ageRestriction?: {
    minAge?: number;
    maxAge?: number;
  };
  entryType?: 'pago' | 'gratuito';
  pricingMode?: 'free' | 'paid';
  startingPriceMinor?: number;
  date?: string;
  endDate?: string;
}

export interface CreateEventOccurrenceInput {
  eventListingId: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  salesStartsAt?: string;
  salesEndsAt?: string;
  locationOverride?: EventLocation;
  rescheduledFromOccurrenceId?: string;
}

export interface UpdateEventOccurrenceInput {
  startsAt?: string;
  endsAt?: string;
  capacity?: number;
  salesStartsAt?: string;
  salesEndsAt?: string;
  locationOverride?: EventLocation;
  status?: EventOccurrenceStatus;
  cancellationReason?: string;
  postponementReason?: string;
  rescheduledToOccurrenceId?: string;
}

/**
 * Deriva o status comercial das vendas da ocorrência sem persistir estado redundante.
 */
export function deriveOccurrenceSalesStatus(params: {
  occurrence: Pick<
    EventOccurrence,
    'status' | 'startsAt' | 'endsAt' | 'capacity' | 'salesStartsAt' | 'salesEndsAt'
  >;
  committedQuantity: number;
  now?: Date;
}): EventOccurrenceSalesStatus {
  const { occurrence, committedQuantity, now = new Date() } = params;
  const nowMs = now.getTime();

  if (occurrence.status !== 'scheduled') {
    return 'closed';
  }

  if (occurrence.salesStartsAt) {
    const salesStartMs = new Date(occurrence.salesStartsAt).getTime();
    if (Number.isFinite(salesStartMs) && nowMs < salesStartMs) {
      return 'not_started';
    }
  }

  const effectiveSalesEnd = occurrence.salesEndsAt || occurrence.startsAt;
  const salesEndMs = new Date(effectiveSalesEnd).getTime();
  if (Number.isFinite(salesEndMs) && nowMs > salesEndMs) {
    return 'closed';
  }

  if (committedQuantity >= occurrence.capacity || occurrence.capacity <= 0) {
    return 'sold_out';
  }

  return 'on_sale';
}

export function canTransitionOccurrenceStatus(
  from: EventOccurrenceStatus,
  to: EventOccurrenceStatus
): boolean {
  if (from === to) return true;
  if (from === 'canceled' || from === 'completed') {
    return false;
  }
  if (from === 'postponed') {
    return to === 'canceled';
  }
  return to === 'postponed' || to === 'canceled' || to === 'completed';
}
