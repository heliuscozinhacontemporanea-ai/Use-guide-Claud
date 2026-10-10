import { partnerService } from '../factory';
import type { PartnerVerificationData } from '../types/partnerTypes';

export async function updatePartnerVerificationProfileUseCase(
  partnerId: string,
  verification: PartnerVerificationData
): Promise<void> {
  if (!partnerId || !partnerId.trim()) {
    throw new Error('ID do parceiro é obrigatório');
  }
  await partnerService.updatePartnerVerificationProfile(partnerId, verification);
}
