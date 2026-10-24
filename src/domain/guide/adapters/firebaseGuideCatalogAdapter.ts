import { subscribeToCollectionUseCase } from '../../database';
import type { FeaturedListings } from '../types/featuredListing';
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
    phone: typeof record.phone === 'string' ? record.phone : undefined,
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

// Uma projeção por lista (7 hoje); o limite só protege a escuta (AGENTS.md §6.4).
const FEATURED_LISTS_LIMIT = 20;

export function toFeaturedListings(
  records: Array<{ list?: string; listingIds?: unknown }>
): FeaturedListings {
  const featured: FeaturedListings = {};
  for (const record of records) {
    if (typeof record.list !== 'string' || !Array.isArray(record.listingIds)) continue;
    featured[record.list as keyof FeaturedListings] = record.listingIds.filter(
      (id): id is string => typeof id === 'string'
    );
  }
  return featured;
}

export class FirebaseGuideCatalogAdapter implements GuideCatalogPort {
  subscribe(
    onUpdate: (snapshot: GuideCatalogSnapshot) => void,
    onError: (error: Error) => void
  ): () => void {
    let items: GuideItem[] = [];
    let events: GuideItem[] = [];
    let featured: FeaturedListings = {};

    const emit = () => {
      onUpdate({
        items,
        events,
        featured,
      });
    };

    const unsubscribeItems = subscribeToCollectionUseCase(
      'items',
      (records) => {
        // Perfil de produtor não é item do guia: só serve de vínculo para os eventos (decisão D9).
        items = records
          .map(mapGuideItem)
          .filter((item) => item.isActive !== false && item.category !== 'producer');
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

    // Destaque é complemento da lista: se a leitura falhar, o catálogo segue sem as vagas.
    const unsubscribeFeatured = subscribeToCollectionUseCase<{
      list?: string;
      listingIds?: unknown;
    }>(
      'featuredListings',
      (records) => {
        featured = toFeaturedListings(records);
        emit();
      },
      (error) => {
        console.error('[FirebaseGuideCatalogAdapter.featured]', error);
        featured = {};
        emit();
      },
      undefined,
      undefined,
      FEATURED_LISTS_LIMIT
    );

    return () => {
      unsubscribeItems();
      unsubscribeEvents();
      unsubscribeFeatured();
    };
  }
}
