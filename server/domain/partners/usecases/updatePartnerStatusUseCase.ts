import { partnerService } from '../factory';
import type { PartnerStatus } from '../types/partnerTypes';

export async function updatePartnerStatusUseCase(
  actor: { uid: string; admin?: boolean },
  partnerId: string,
  status: PartnerStatus
): Promise<void> {
  return partnerService.updatePartnerStatus(actor, partnerId, status);
}
