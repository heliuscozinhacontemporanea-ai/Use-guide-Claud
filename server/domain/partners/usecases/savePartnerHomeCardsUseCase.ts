import { partnerService } from '../factory';
import type { PartnerHomeCardId } from '../types/partnerHomeCards';

export function savePartnerHomeCardsUseCase(
  partnerId: string,
  cards: string[]
): Promise<PartnerHomeCardId[]> {
  return partnerService.setHomeCards(partnerId, cards);
}
