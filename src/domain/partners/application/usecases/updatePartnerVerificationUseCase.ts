import { updatePartnerVerificationSchema } from '../../schemas/partnerSchema';
import { partnerAdapter } from '../../factory';
import type { PartnerVerificationType } from '../../types/partner';

export async function updatePartnerVerificationUseCase(
  partnerId: string,
  isVerified: boolean,
  verifiedUntil?: string | null,
  verificationType?: PartnerVerificationType
): Promise<void> {
  updatePartnerVerificationSchema.parse({
    partnerId,
    isVerified,
    ...(verifiedUntil !== undefined ? { verifiedUntil } : {}),
    ...(verificationType !== undefined ? { verificationType } : {}),
  });

  return partnerAdapter.updatePartnerVerification(
    partnerId,
    isVerified,
    verifiedUntil,
    verificationType
  );
}
