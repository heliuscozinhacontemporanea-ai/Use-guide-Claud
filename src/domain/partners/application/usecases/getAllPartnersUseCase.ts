import { partnerAdapter } from '../../factory';
import { PartnerProfile } from '../../types/partner';

export async function getAllPartnersUseCase(): Promise<PartnerProfile[]> {
  return partnerAdapter.getAllPartners();
}
