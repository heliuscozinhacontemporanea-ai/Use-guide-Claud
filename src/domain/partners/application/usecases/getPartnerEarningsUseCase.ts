import { partnerHomeAdapter } from '../../factory';
import type { PartnerEarnings } from '../../types/partnerHome';

export function getPartnerEarningsUseCase(): Promise<PartnerEarnings> {
  return partnerHomeAdapter.getEarnings();
}
