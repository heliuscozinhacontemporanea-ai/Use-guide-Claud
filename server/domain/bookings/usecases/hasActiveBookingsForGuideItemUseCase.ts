import { getOfferService } from '../factory';

/** Se o item do guia tem reserva aguardando pagamento ou confirmada (trava de excluir o anúncio). */
export async function hasActiveBookingsForGuideItemUseCase(guideItemId: string): Promise<boolean> {
  return getOfferService().hasActiveBookingsForGuideItem(guideItemId);
}
