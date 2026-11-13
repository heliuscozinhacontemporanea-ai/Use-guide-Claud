import { listPartnerOffersUseCase } from '../../../domain/bookings';
import { listOwnerGuideItemsUseCase } from '../../../domain/guide';

/**
 * Atrações do dono que têm portaria (C1): lugares com oferta de entrada que não foi arquivada. A
 * posse vem das listas do próprio dono, então um lugar de outra conta nunca aparece aqui.
 */
export async function ownerGatePlaces(
  ownerUid: string
): Promise<Array<{ id: string; title: string }>> {
  const [offers, items] = await Promise.all([
    listPartnerOffersUseCase({ uid: ownerUid, admin: false }),
    listOwnerGuideItemsUseCase(ownerUid),
  ]);
  const withEntry = new Set(
    offers
      .filter((offer) => offer.kind === 'private_entry' && offer.status !== 'archived')
      .map((offer) => offer.guideItemId)
  );
  return items
    .filter((item) => withEntry.has(item.id))
    .map((item) => ({ id: item.id, title: item.name }));
}
