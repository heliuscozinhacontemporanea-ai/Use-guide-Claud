import { partnerService } from '../factory';
import type { PartnerBusiness } from '../types/partnerTypes';

export async function linkBusinessUseCase(
  partnerId: string,
  business: PartnerBusiness
): Promise<void> {
  return partnerService.linkBusiness(partnerId, business);
}
