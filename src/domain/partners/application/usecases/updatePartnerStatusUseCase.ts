import { partnerAdapter } from '../../factory';
import { updatePartnerStatusSchema } from '../../schemas/partnerSchema';
import type { PartnerAccountStatus } from '../../types/partner';

export async function updatePartnerStatusUseCase(
  partnerId: string,
  status: PartnerAccountStatus
): Promise<void> {
  updatePartnerStatusSchema.parse({ partnerId, status });
  return partnerAdapter.updatePartnerStatus(partnerId, status);
}
