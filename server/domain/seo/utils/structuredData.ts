import type { SeoEvent, SeoEventOccurrence, SeoGuideItem } from '../types/seoTypes';

const SCHEMA_CONTEXT = 'https://schema.org';

const SCHEMA_TYPE_BY_CATEGORY: Record<SeoGuideItem['category'], string> = {
  restaurant: 'Restaurant',
  hotel: 'LodgingBusiness',
  sight: 'TouristAttraction',
  tour: 'TouristTrip',
  transfer: 'TaxiService',
  rental: 'LocalBusiness',
  tips: 'Article',
};

// O cadastro guarda a localidade como código; o schema.org precisa do nome do lugar.
const LOCALITY_NAMES: Record<string, string> = {
  jeri: 'Jericoacoara',
  prea: 'Preá',
  barrinha: 'Barrinha de Baixo',
};

function resolveLocality(location: string | undefined): string | undefined {
  if (!location) return undefined;
  return LOCALITY_NAMES[location] ?? location;
}

function buildPostalAddress(streetAddress: string | undefined, location: string | undefined) {
  return {
    '@type': 'PostalAddress',
    ...(streetAddress ? { streetAddress } : {}),
    ...(resolveLocality(location) ? { addressLocality: resolveLocality(location) } : {}),
    addressRegion: 'CE',
    addressCountry: 'BR',
  };
}

export function buildGuideItemStructuredData(
  item: SeoGuideItem,
  page: { url: string; image: string; description: string }
): Record<string, unknown> {
  const type = SCHEMA_TYPE_BY_CATEGORY[item.category];
  const data: Record<string, unknown> = {
    '@context': SCHEMA_CONTEXT,
    '@type': type,
    url: page.url,
    image: page.image,
    description: page.description,
    inLanguage: 'pt-BR',
  };

  if (type === 'Article') {
    data.headline = item.name;
    return data;
  }

  data.name = item.name;
  if (type !== 'TouristTrip') {
    data.address = buildPostalAddress(item.address, item.location);
  }
  if (type === 'Restaurant' && item.cuisineType) {
    data.servesCuisine = item.cuisineType;
  }
  if (item.offer) {
    // schema.org espera o preço em reais com duas casas, como texto.
    data.offers = {
      '@type': 'Offer',
      price: (item.offer.lowestPriceMinor / 100).toFixed(2),
      priceCurrency: 'BRL',
      availability: item.offer.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/SoldOut',
      url: page.url,
    };
  }
  if (item.reviewCount > 0) {
    data.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: item.rating,
      reviewCount: item.reviewCount,
    };
  }
  return data;
}

/** Próxima ocorrência a partir de `now`; se todas já passaram, a mais recente. */
export function pickRelevantOccurrence(
  occurrences: SeoEventOccurrence[],
  now: Date
): SeoEventOccurrence | null {
  const sorted = [...occurrences].sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
  );
  const upcoming = sorted.find((occurrence) => new Date(occurrence.startsAt) >= now);
  return upcoming ?? sorted.at(-1) ?? null;
}

export function buildEventStructuredData(
  event: SeoEvent,
  occurrence: SeoEventOccurrence | null,
  page: { url: string; image: string; description: string }
): Record<string, unknown> {
  if (!occurrence) {
    return {
      '@context': SCHEMA_CONTEXT,
      '@type': 'WebPage',
      name: event.name,
      url: page.url,
      image: page.image,
      description: page.description,
      inLanguage: 'pt-BR',
    };
  }

  const locationName = occurrence.locationName ?? event.locationName ?? event.name;
  const locationAddress = occurrence.locationAddress ?? event.locationAddress;
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'Event',
    name: event.name,
    url: page.url,
    image: page.image,
    description: page.description,
    inLanguage: 'pt-BR',
    startDate: occurrence.startsAt,
    endDate: occurrence.endsAt,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: locationName,
      address: buildPostalAddress(locationAddress, undefined),
    },
  };
}
