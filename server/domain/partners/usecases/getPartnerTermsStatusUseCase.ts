import { partnerService } from '../factory';
import type { PartnerTermsStatus } from '../services/partnerService';

export function getPartnerTermsStatusUseCase(partnerId: string): Promise<PartnerTermsStatus> {
  return partnerService.getTermsStatus(partnerId);
}
