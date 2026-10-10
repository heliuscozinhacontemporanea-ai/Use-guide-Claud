import { partnerService } from '../factory';

export async function unlinkBusinessUseCase(partnerId: string, businessId: string): Promise<void> {
  return partnerService.unlinkBusiness(partnerId, businessId);
}
