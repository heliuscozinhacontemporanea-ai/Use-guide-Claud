import { fetchPublishedOffersForItem } from '../../adapters/firestorePublicOffersAdapter';
import type { PublicOffer } from '../../types/bookings';

export async function listPublishedOffersForItemUseCase(
  guideItemId: string
): Promise<PublicOffer[]> {
  return fetchPublishedOffersForItem(guideItemId);
}
