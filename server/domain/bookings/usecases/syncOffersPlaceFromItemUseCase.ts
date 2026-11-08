import { getOfferPlaceService } from '../factory';

/** Depois de o estabelecimento mudar de estado ou cidade, as ofertas dele passam a usar o novo fuso. */
export async function syncOffersPlaceFromItemUseCase(guideItemId: string): Promise<void> {
  return getOfferPlaceService().syncFromItem(guideItemId);
}
