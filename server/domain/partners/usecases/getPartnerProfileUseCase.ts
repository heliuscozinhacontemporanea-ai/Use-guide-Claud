import { partnerService } from '../factory';
import type { PartnerProfileDocument } from '../types/partnerTypes';

export async function getPartnerProfileUseCase(
  partnerId: string
): Promise<PartnerProfileDocument | null> {
  return partnerService.getProfile(partnerId);
}
