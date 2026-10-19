import { updatePartnerVerificationSchema } from '../../schemas/partnerSchema';
import { partnerAdapter } from '../../factory';

/** Admin concede ou retira o selo; o servidor preserva o plano pago do parceiro. */
export async function updatePartnerVerificationUseCase(
  partnerId: string,
  isVerified: boolean
): Promise<void> {
  updatePartnerVerificationSchema.parse({ partnerId, isVerified });
  return partnerAdapter.updatePartnerVerification(partnerId, isVerified);
}
