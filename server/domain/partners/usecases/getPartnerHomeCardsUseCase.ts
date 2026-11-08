import { partnerService } from '../factory';
import type { PartnerHomeCardId } from '../types/partnerHomeCards';

export function getPartnerHomeCardsUseCase(partnerId: string): Promise<PartnerHomeCardId[]> {
  return partnerService.getHomeCards(partnerId);
}
