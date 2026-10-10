import { partnerService } from '../factory';
import type { PartnerProfileDocument } from '../types/partnerTypes';

export async function getAllPartnersUseCase(): Promise<PartnerProfileDocument[]> {
  return partnerService.getAllPartners();
}
