import { partnerService } from '../factory';

export async function getAllPartnerIdsUseCase(): Promise<string[]> {
  return partnerService.getAllPartnerIds();
}
