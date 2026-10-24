import type { FeaturedListings } from '../types/featuredListing';
import { GuideItem } from '../types/guide';

export interface GuideCatalogSnapshot {
  items: GuideItem[];
  events: GuideItem[];
  featured: FeaturedListings;
}

export interface GuideCatalogPort {
  subscribe(
    onUpdate: (snapshot: GuideCatalogSnapshot) => void,
    onError: (error: Error) => void
  ): () => void;
}
