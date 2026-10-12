import { getPublicOfferSummaryUseCase } from '../../domain/bookings';
import {
  getEventListingByIdUseCase,
  listEventOccurrencesUseCase,
  listPublicEventListingsUseCase,
} from '../../domain/events';
import { getPublicGuideItemUseCase, listPublicGuideItemsUseCase } from '../../domain/guide';
import type { SeoContentPort, SeoEvent, SeoGuideItem, SeoSitemapEntry } from '../../domain/seo';

/**
 * Conteúdo do catálogo para o domínio seo, que é folha (AGENTS.md §5.4) e não conhece guide nem events.
 * Devolve só campos públicos: sem dono, contato ou PII.
 */
export class CatalogSeoContentProvider implements SeoContentPort {
  async getGuideItem(id: string): Promise<SeoGuideItem | null> {
    const item = await getPublicGuideItemUseCase(id);
    if (!item) return null;
    const offer =
      item.category === 'tour' || item.category === 'sight'
        ? await getPublicOfferSummaryUseCase(item.id)
        : null;
    return {
      ...(offer
        ? {
            offer: {
              lowestPriceMinor: offer.lowestUnitAmountMinor,
              inStock: offer.hasAvailability,
            },
          }
        : {}),
      id: item.id,
      name: item.name,
      description: item.description ?? '',
      category: item.category,
      image: item.image || undefined,
      location: item.location || undefined,
      address: item.address || undefined,
      cuisineType: item.operationalInfo?.cuisineType || undefined,
      rating: item.rating ?? 0,
      reviewCount: item.reviewCount ?? 0,
    };
  }

  async getEvent(id: string): Promise<SeoEvent | null> {
    const listing = await getEventListingByIdUseCase(id);
    if (listing?.status !== 'published' || listing.visibility !== 'public') {
      return null;
    }
    const occurrences = await listEventOccurrencesUseCase(id, { publicOnly: true });
    return {
      id: listing.id,
      name: listing.title || listing.name,
      description: listing.summary || listing.description || '',
      image: listing.coverImage || listing.image || undefined,
      locationName: listing.location?.name,
      locationAddress: listing.location?.address,
      occurrences: occurrences
        .filter(
          (occurrence) => occurrence.status === 'scheduled' || occurrence.status === 'completed'
        )
        .map((occurrence) => ({
          startsAt: occurrence.startsAt,
          endsAt: occurrence.endsAt,
          locationName: occurrence.locationOverride?.name,
          locationAddress: occurrence.locationOverride?.address,
        })),
    };
  }

  async listIndexableEntries(): Promise<SeoSitemapEntry[]> {
    const [items, events] = await Promise.all([
      listPublicGuideItemsUseCase(),
      listPublicEventListingsUseCase(),
    ]);
    return [
      ...items.map((item) => ({ id: item.id, category: item.category })),
      ...events.map((event) => ({ id: event.id, category: 'event' as const })),
    ];
  }
}
