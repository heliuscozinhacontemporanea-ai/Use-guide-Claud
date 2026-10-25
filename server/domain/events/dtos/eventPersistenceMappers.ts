import { isCancellationPolicyAllowed } from '../../../shared/kernel/cancellationPolicy';
import {
  type CreateEventListingInput,
  type CreateEventOccurrenceInput,
  DEFAULT_EVENT_SALES_POLICY,
  type EventListing,
  type EventLocation,
  type EventOccurrence,
  type EventRatingSummary,
  type EventSalesPolicy,
  type UpdateEventListingInput,
} from '../types/eventTypes';

/** Campo ausente ou fora das opções vira o padrão da plataforma, nunca uma regra que ninguém escolheu. */
function toSalesPolicy(raw: unknown): EventSalesPolicy {
  const policy = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const cancellationPolicy =
    typeof policy.cancellationPolicy === 'string' &&
    isCancellationPolicyAllowed('event', policy.cancellationPolicy)
      ? (policy.cancellationPolicy as EventSalesPolicy['cancellationPolicy'])
      : DEFAULT_EVENT_SALES_POLICY.cancellationPolicy;
  return {
    cancellationPolicy,
    serviceFeeMode: policy.serviceFeeMode === 'absorb' ? 'absorb' : 'pass_to_buyer',
    allowTicketTransfer:
      typeof policy.allowTicketTransfer === 'boolean'
        ? policy.allowTicketTransfer
        : DEFAULT_EVENT_SALES_POLICY.allowTicketTransfer,
    ticketTransferCutoffHours:
      typeof policy.ticketTransferCutoffHours === 'number'
        ? policy.ticketTransferCutoffHours
        : DEFAULT_EVENT_SALES_POLICY.ticketTransferCutoffHours,
  };
}

function toIsoString(val: unknown, fallback: string): string {
  if (typeof val === 'string' && val.trim().length > 0) return val;
  if (
    val &&
    typeof val === 'object' &&
    'toDate' in val &&
    typeof (val as { toDate: () => Date }).toDate === 'function'
  ) {
    return (val as { toDate: () => Date }).toDate().toISOString();
  }
  return fallback;
}

export class EventListingPersistenceMapper {
  static toDomain(id: string, raw: Record<string, unknown>): EventListing {
    const nowIso = new Date().toISOString();
    const title = String(raw.title || raw.name || '').trim();
    const coverImage = String(raw.coverImage || raw.image || '').trim();
    const images = Array.isArray(raw.images)
      ? raw.images.filter((i): i is string => typeof i === 'string')
      : coverImage
        ? [coverImage]
        : [];

    const rawLoc = raw.location;
    const location: EventLocation =
      rawLoc && typeof rawLoc === 'object'
        ? {
            name:
              typeof (rawLoc as Record<string, unknown>).name === 'string'
                ? String((rawLoc as Record<string, unknown>).name)
                : undefined,
            address:
              typeof (rawLoc as Record<string, unknown>).address === 'string'
                ? String((rawLoc as Record<string, unknown>).address)
                : typeof raw.address === 'string'
                  ? raw.address
                  : undefined,
            googleMapsLink:
              typeof (rawLoc as Record<string, unknown>).googleMapsLink === 'string'
                ? String((rawLoc as Record<string, unknown>).googleMapsLink)
                : typeof raw.googleMapsLink === 'string'
                  ? raw.googleMapsLink
                  : undefined,
            latitude:
              typeof (rawLoc as Record<string, unknown>).latitude === 'number'
                ? Number((rawLoc as Record<string, unknown>).latitude)
                : undefined,
            longitude:
              typeof (rawLoc as Record<string, unknown>).longitude === 'number'
                ? Number((rawLoc as Record<string, unknown>).longitude)
                : undefined,
          }
        : {
            name: typeof rawLoc === 'string' ? rawLoc : 'Jericoacoara',
            address: typeof raw.address === 'string' ? raw.address : undefined,
            googleMapsLink: typeof raw.googleMapsLink === 'string' ? raw.googleMapsLink : undefined,
          };

    const rawRatingSummary = raw.ratingSummary as Record<string, unknown> | undefined;
    const ratingSummary: EventRatingSummary | undefined =
      rawRatingSummary &&
      typeof rawRatingSummary.average === 'number' &&
      typeof rawRatingSummary.count === 'number' &&
      rawRatingSummary.count > 0
        ? {
            average: rawRatingSummary.average,
            count: rawRatingSummary.count,
          }
        : typeof raw.rating === 'number' &&
            typeof raw.reviewCount === 'number' &&
            raw.reviewCount > 0
          ? {
              average: raw.rating,
              count: raw.reviewCount,
            }
          : undefined;

    const status =
      raw.status === 'draft' ||
      raw.status === 'published' ||
      raw.status === 'paused' ||
      raw.status === 'archived'
        ? raw.status
        : raw.isActive === false
          ? 'paused'
          : 'published';

    const ownerId = String(raw.ownerId || '');

    return {
      id,
      ownerId,
      partnerId: typeof raw.partnerId === 'string' ? raw.partnerId : undefined,
      establishmentId: typeof raw.establishmentId === 'string' ? raw.establishmentId : undefined,
      title,
      name: title,
      summary: typeof raw.summary === 'string' ? raw.summary : undefined,
      description: String(raw.description || ''),
      category: String(raw.eventCategory || raw.category || 'geral'),
      eventCategory: String(raw.eventCategory || raw.category || 'geral'),
      customCategory: typeof raw.customCategory === 'string' ? raw.customCategory : undefined,
      coverImage,
      image: coverImage,
      images,
      visibility:
        raw.visibility === 'unlisted' || raw.visibility === 'private' ? raw.visibility : 'public',
      status,
      isActive: status === 'published',
      organizerId: String(raw.organizerId || ownerId),
      location,
      phone: typeof raw.phone === 'string' ? raw.phone : undefined,
      websiteLink: typeof raw.websiteLink === 'string' ? raw.websiteLink : undefined,
      instagramLink: typeof raw.instagramLink === 'string' ? raw.instagramLink : undefined,
      bookingLink: typeof raw.bookingLink === 'string' ? raw.bookingLink : undefined,
      salesPolicy: toSalesPolicy(raw.salesPolicy),
      maxTicketsPerUserPerOccurrence:
        typeof raw.maxTicketsPerUserPerOccurrence === 'number'
          ? raw.maxTicketsPerUserPerOccurrence
          : undefined,
      ageRestriction: raw.ageRestriction as EventListing['ageRestriction'],
      ratingSummary,
      entryType:
        raw.entryType === 'pago' || raw.entryType === 'gratuito' ? raw.entryType : undefined,
      pricingMode:
        raw.pricingMode === 'paid' || raw.pricingMode === 'free'
          ? raw.pricingMode
          : raw.entryType === 'pago'
            ? 'paid'
            : 'free',
      startingPriceMinor:
        typeof raw.startingPriceMinor === 'number' ? raw.startingPriceMinor : undefined,
      date: typeof raw.date === 'string' ? raw.date : undefined,
      endDate: typeof raw.endDate === 'string' ? raw.endDate : undefined,
      createdAt: toIsoString(raw.createdAt, nowIso),
      updatedAt: toIsoString(raw.updatedAt, nowIso),
    };
  }

  static toPersistenceCreate(input: CreateEventListingInput): Record<string, unknown> {
    const nowIso = new Date().toISOString();
    const title = (input.title || input.name || '').trim();
    const coverImage = (input.coverImage || input.image || input.images[0] || '').trim();
    const rawLocationObj: EventLocation =
      typeof input.location === 'string'
        ? {
            name: input.location,
            address: input.address,
            googleMapsLink: input.googleMapsLink,
          }
        : input.location;
    const locationObj: EventLocation = {
      ...(rawLocationObj.name !== undefined ? { name: rawLocationObj.name } : {}),
      ...(rawLocationObj.address !== undefined ? { address: rawLocationObj.address } : {}),
      ...(rawLocationObj.googleMapsLink !== undefined
        ? { googleMapsLink: rawLocationObj.googleMapsLink }
        : {}),
      ...(rawLocationObj.latitude !== undefined ? { latitude: rawLocationObj.latitude } : {}),
      ...(rawLocationObj.longitude !== undefined ? { longitude: rawLocationObj.longitude } : {}),
    };

    const status = input.status || (input.isActive === false ? 'paused' : 'published');
    const eventCategory = input.eventCategory || input.category || 'geral';

    return {
      ownerId: input.ownerId,
      ...(input.partnerId ? { partnerId: input.partnerId } : {}),
      ...(input.establishmentId ? { establishmentId: input.establishmentId } : {}),
      title,
      name: title,
      ...(input.summary ? { summary: input.summary } : {}),
      description: input.description,
      category: 'event',
      eventCategory,
      ...(input.customCategory ? { customCategory: input.customCategory } : {}),
      coverImage,
      image: coverImage,
      images: input.images,
      visibility: input.visibility || 'public',
      status,
      isActive: status === 'published',
      organizerId: input.organizerId || input.ownerId,
      location: locationObj.name || 'Jericoacoara',
      locationDetails: locationObj,
      ...(locationObj.address || input.address
        ? { address: locationObj.address || input.address }
        : {}),
      ...(locationObj.googleMapsLink || input.googleMapsLink
        ? { googleMapsLink: locationObj.googleMapsLink || input.googleMapsLink }
        : {}),
      ...(input.phone ? { phone: input.phone } : {}),
      ...(input.websiteLink ? { websiteLink: input.websiteLink } : {}),
      ...(input.instagramLink ? { instagramLink: input.instagramLink } : {}),
      ...(input.bookingLink ? { bookingLink: input.bookingLink } : {}),
      salesPolicy: input.salesPolicy ?? DEFAULT_EVENT_SALES_POLICY,
      ...(input.ageRestriction ? { ageRestriction: input.ageRestriction } : {}),
      entryType: input.entryType || 'gratuito',
      pricingMode: input.pricingMode || (input.entryType === 'pago' ? 'paid' : 'free'),
      ...(input.startingPriceMinor !== undefined
        ? { startingPriceMinor: input.startingPriceMinor }
        : {}),
      ...(input.maxTicketsPerUserPerOccurrence !== undefined
        ? { maxTicketsPerUserPerOccurrence: input.maxTicketsPerUserPerOccurrence }
        : {}),
      ...(input.date ? { date: input.date } : {}),
      ...(input.endDate ? { endDate: input.endDate } : {}),
      createdAt: nowIso,
      updatedAt: nowIso,
    };
  }

  static toPersistenceUpdate(input: UpdateEventListingInput): Record<string, unknown> {
    const patch: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (input.title !== undefined || input.name !== undefined) {
      const title = (input.title || input.name || '').trim();
      patch.title = title;
      patch.name = title;
    }
    if (input.summary !== undefined) patch.summary = input.summary;
    if (input.description !== undefined) patch.description = input.description;
    if (input.eventCategory !== undefined || input.category !== undefined) {
      const cat = input.eventCategory || input.category || 'geral';
      patch.eventCategory = cat;
    }
    if (input.customCategory !== undefined) patch.customCategory = input.customCategory;
    if (input.coverImage !== undefined || input.image !== undefined) {
      const img = input.coverImage ?? input.image ?? '';
      patch.coverImage = img;
      patch.image = img;
    }
    if (input.images !== undefined) patch.images = input.images;
    if (input.visibility !== undefined) patch.visibility = input.visibility;
    if (input.status !== undefined) {
      patch.status = input.status;
      patch.isActive = input.status === 'published';
    } else if (input.isActive !== undefined) {
      patch.isActive = input.isActive;
      patch.status = input.isActive ? 'published' : 'paused';
    }
    if (input.location !== undefined) {
      if (typeof input.location === 'string') {
        patch.location = input.location;
      } else {
        patch.location = input.location.name || 'Jericoacoara';
        patch.locationDetails = input.location;
      }
    }
    if (input.address !== undefined) patch.address = input.address;
    if (input.googleMapsLink !== undefined) patch.googleMapsLink = input.googleMapsLink;
    if (input.phone !== undefined) patch.phone = input.phone;
    if (input.websiteLink !== undefined) patch.websiteLink = input.websiteLink;
    if (input.instagramLink !== undefined) patch.instagramLink = input.instagramLink;
    if (input.bookingLink !== undefined) patch.bookingLink = input.bookingLink;
    if (input.salesPolicy !== undefined) patch.salesPolicy = input.salesPolicy;
    if (input.ageRestriction !== undefined) patch.ageRestriction = input.ageRestriction;
    if (input.entryType !== undefined) {
      patch.entryType = input.entryType;
      patch.pricingMode = input.entryType === 'pago' ? 'paid' : 'free';
    }
    if (input.pricingMode !== undefined) patch.pricingMode = input.pricingMode;
    if (input.startingPriceMinor !== undefined) patch.startingPriceMinor = input.startingPriceMinor;
    if (input.maxTicketsPerUserPerOccurrence !== undefined)
      patch.maxTicketsPerUserPerOccurrence = input.maxTicketsPerUserPerOccurrence;
    if (input.date !== undefined) patch.date = input.date;
    if (input.endDate !== undefined) patch.endDate = input.endDate;

    delete patch.ownerId;
    delete patch.ratingSummary;

    return patch;
  }
}

export class EventOccurrencePersistenceMapper {
  static toDomain(id: string, raw: Record<string, unknown>): EventOccurrence {
    const nowIso = new Date().toISOString();
    return {
      id,
      eventListingId: String(raw.eventListingId || ''),
      startsAt: String(raw.startsAt || ''),
      endsAt: String(raw.endsAt || ''),
      status:
        raw.status === 'postponed' || raw.status === 'canceled' || raw.status === 'completed'
          ? raw.status
          : 'scheduled',
      capacity: typeof raw.capacity === 'number' && raw.capacity > 0 ? raw.capacity : 100,
      salesStartsAt: typeof raw.salesStartsAt === 'string' ? raw.salesStartsAt : undefined,
      salesEndsAt: typeof raw.salesEndsAt === 'string' ? raw.salesEndsAt : undefined,
      locationOverride: raw.locationOverride as EventLocation | undefined,
      cancellationReason:
        typeof raw.cancellationReason === 'string' ? raw.cancellationReason : undefined,
      postponementReason:
        typeof raw.postponementReason === 'string' ? raw.postponementReason : undefined,
      rescheduledToOccurrenceId:
        typeof raw.rescheduledToOccurrenceId === 'string'
          ? raw.rescheduledToOccurrenceId
          : undefined,
      rescheduledFromOccurrenceId:
        typeof raw.rescheduledFromOccurrenceId === 'string'
          ? raw.rescheduledFromOccurrenceId
          : undefined,
      createdAt: toIsoString(raw.createdAt, nowIso),
      updatedAt: toIsoString(raw.updatedAt, nowIso),
    };
  }

  static toPersistenceCreate(input: CreateEventOccurrenceInput): Record<string, unknown> {
    const nowIso = new Date().toISOString();
    return {
      eventListingId: input.eventListingId,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      status: 'scheduled',
      capacity: input.capacity,
      ...(input.salesStartsAt ? { salesStartsAt: input.salesStartsAt } : {}),
      ...(input.salesEndsAt ? { salesEndsAt: input.salesEndsAt } : {}),
      ...(input.locationOverride ? { locationOverride: input.locationOverride } : {}),
      ...(input.rescheduledFromOccurrenceId
        ? { rescheduledFromOccurrenceId: input.rescheduledFromOccurrenceId }
        : {}),
      createdAt: nowIso,
      updatedAt: nowIso,
    };
  }
}
