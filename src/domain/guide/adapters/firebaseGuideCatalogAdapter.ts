import { subscribeToCollectionUseCase } from '../../database';
import { GuideCatalogPort, GuideCatalogSnapshot } from '../ports/guideCatalogPort';
import { GuideItem } from '../types/guide';

export function mapGuideItem(record: Record<string, unknown>): GuideItem {
  const category =
    record.category === 'event' ? 'event' : (record.category as GuideItem['category']);

  return {
    id: String(record.id ?? ''),
    contentType: category === 'event' ? 'event' : 'item',
    name: typeof record.name === 'string' ? record.name : '',
    description: typeof record.description === 'string' ? record.description : '',
    category,
    image: typeof record.image === 'string' ? record.image : '',
    images: Array.isArray(record.images)
      ? record.images.filter((value): value is string => typeof value === 'string')
      : [],
    location: typeof record.location === 'string' ? record.location : '',
    rating: typeof record.rating === 'number' ? record.rating : undefined,
    reviewCount: typeof record.reviewCount === 'number' ? record.reviewCount : undefined,
    googleMapsType: typeof record.googleMapsType === 'string' ? record.googleMapsType : undefined,
    mapLink: typeof record.mapLink === 'string' ? record.mapLink : undefined,
    instagramLink: typeof record.instagramLink === 'string' ? record.instagramLink : undefined,
    websiteLink: typeof record.websiteLink === 'string' ? record.websiteLink : undefined,
    bookingLink: typeof record.bookingLink === 'string' ? record.bookingLink : undefined,
    whatsappLink: typeof record.whatsappLink === 'string' ? record.whatsappLink : undefined,
    googleMapsLink: typeof record.googleMapsLink === 'string' ? record.googleMapsLink : undefined,
    address: typeof record.address === 'string' ? record.address : undefined,
    tags: Array.isArray(record.tags)
      ? record.tags.filter((value): value is string => typeof value === 'string')
      : undefined,
    partnerId: typeof record.partnerId === 'string' ? record.partnerId : undefined,
    ownerId: typeof record.ownerId === 'string' ? record.ownerId : undefined,
    establishmentId:
      typeof record.establishmentId === 'string' ? record.establishmentId : undefined,
    isVerified: typeof record.isVerified === 'boolean' ? record.isVerified : undefined,
    verifiedUntil:
      typeof record.verifiedUntil === 'string'
        ? record.verifiedUntil
        : record.verifiedUntil === null
          ? null
          : undefined,
    verificationType:
      record.verificationType === 'trial' ||
      record.verificationType === 'monthly' ||
      record.verificationType === 'semi-annual' ||
      record.verificationType === 'annual' ||
      record.verificationType === 'admin'
        ? record.verificationType
        : null,
    isVerificationSuspended:
      typeof record.isVerificationSuspended === 'boolean'
        ? record.isVerificationSuspended
        : undefined,
    operationalInfo:
      typeof record.operationalInfo === 'object' && record.operationalInfo !== null
        ? (record.operationalInfo as GuideItem['operationalInfo'])
        : undefined,
    isActive: record.isActive !== false,
    date: typeof record.date === 'string' ? record.date : undefined,
    endDate: typeof record.endDate === 'string' ? record.endDate : undefined,
    eventCategory: typeof record.eventCategory === 'string' ? record.eventCategory : undefined,
    customCategory: typeof record.customCategory === 'string' ? record.customCategory : undefined,
  };
}

export function isActiveEvent(event: GuideItem): boolean {
  if (event.isActive === false) {
    return false;
  }
  if (!event.date) {
    return false;
  }
  const start = new Date(event.date).getTime();
  if (Number.isNaN(start)) {
    return false;
  }
  if (!event.endDate) {
    return start >= Date.now();
  }
  const end = new Date(event.endDate).getTime();
  if (Number.isNaN(end)) {
    return false;
  }
  return end >= Date.now();
}

export class FirebaseGuideCatalogAdapter implements GuideCatalogPort {
  subscribe(
    onUpdate: (snapshot: GuideCatalogSnapshot) => void,
    onError: (error: Error) => void
  ): () => void {
    let items: GuideItem[] = [];
    let events: GuideItem[] = [];

    const emit = () => {
      onUpdate({
        items,
        events,
      });
    };

    const unsubscribeItems = subscribeToCollectionUseCase(
      'items',
      (records) => {
        items = records.map(mapGuideItem).filter((item) => item.isActive !== false);
        emit();
      },
      onError
    );

    const unsubscribeEvents = subscribeToCollectionUseCase(
      'events',
      (records) => {
        events = records
          .map((record) =>
            mapGuideItem({
              ...record,
              category: 'event',
            })
          )
          .filter(isActiveEvent)
          .sort((a, b) => {
            const aTime = a.date ? new Date(a.date).getTime() : Number.MAX_SAFE_INTEGER;
            const bTime = b.date ? new Date(b.date).getTime() : Number.MAX_SAFE_INTEGER;
            return aTime - bTime;
          });
        emit();
      },
      onError,
      [
        { field: 'status', op: '==', value: 'published' },
        { field: 'visibility', op: '==', value: 'public' },
      ]
    );

    return () => {
      unsubscribeItems();
      unsubscribeEvents();
    };
  }
}
