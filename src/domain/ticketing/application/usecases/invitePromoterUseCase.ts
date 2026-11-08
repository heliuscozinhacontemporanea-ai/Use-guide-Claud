import { promoterAdapter } from '../../factory';
import type { PromoterEarning } from '../../types/promoter';

export function invitePromoterUseCase(
  eventListingId: string,
  username: string,
  earning: PromoterEarning
) {
  return promoterAdapter.invitePromoter(eventListingId, username.trim().replace(/^@/, ''), earning);
}
