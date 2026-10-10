import { partnerService } from '../factory';
import type { PartnerBusiness } from '../types/partnerTypes';

export async function updateBusinessUseCase(
  partnerId: string,
  business: PartnerBusiness
): Promise<void> {
  return partnerService.updateBusiness(partnerId, business);
}
