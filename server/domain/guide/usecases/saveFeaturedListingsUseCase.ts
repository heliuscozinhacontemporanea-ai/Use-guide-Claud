import { featuredListingsRepository } from '../factory';
import type { FeaturedListingsProjection } from '../types/featuredListing';

export function saveFeaturedListingsUseCase(
  projections: FeaturedListingsProjection[]
): Promise<void> {
  return featuredListingsRepository.replaceAll(projections);
}
