import { partnerService } from '../factory';

export async function deletePartnerProfileUseCase(partnerId: string): Promise<void> {
  return partnerService.deletePartnerProfile(partnerId);
}
