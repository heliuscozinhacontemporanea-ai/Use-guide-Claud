import { getOfferService } from '../factory';

/** As ofertas do anúncio excluído saem do app; as reservas antigas ficam guardadas. */
export async function archiveOffersOfGuideItemUseCase(guideItemId: string): Promise<void> {
  return getOfferService().archiveOffersOfGuideItem(guideItemId);
}
