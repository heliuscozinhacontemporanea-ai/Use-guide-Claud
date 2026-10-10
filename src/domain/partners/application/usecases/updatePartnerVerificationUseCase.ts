import { updatePartnerVerificationSchema } from '../../schemas/partnerSchema';
import { partnerAdapter } from '../../factory';
import type { PartnerVerificationType } from '../../types/partner';

export async function updatePartnerVerificationUseCase(
  partnerId: string,
  isVerified: boolean,
  verifiedUntil: string | null = null,
  verificationType: PartnerVerificationType = null
): Promise<void> {
  updatePartnerVerificationSchema.parse({
    partnerId,
    isVerified,
    verifiedUntil,
    verificationType,
  });

  return partnerAdapter.updatePartnerVerification(
    partnerId,
    isVerified,
    verifiedUntil,
    verificationType
  );
}
