import { promoterAdapter } from '../../factory';

export function getEventPromotersUseCase(eventListingId: string) {
  return promoterAdapter.getEventPromoters(eventListingId);
}
