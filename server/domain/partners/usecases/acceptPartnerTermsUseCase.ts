import { partnerService } from '../factory';
import type { PartnerTermsStatus } from '../services/partnerService';

export function acceptPartnerTermsUseCase(
  partnerId: string,
  version: string
): Promise<PartnerTermsStatus> {
  return partnerService.acceptTerms(partnerId, version);
}
