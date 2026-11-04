import { partnerHomeAdapter } from '../../factory';
import type { PartnerHomeView } from '../../types/partnerHome';

export function getPartnerHomeUseCase(): Promise<PartnerHomeView> {
  return partnerHomeAdapter.get();
}
