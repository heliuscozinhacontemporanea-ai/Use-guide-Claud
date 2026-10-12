import { getPartnerProfileUseCase } from '../../domain/partners';
import type { PartnerVerificationType } from '../../domain/partners';
import { applyPartnerVerification } from './applyPartnerVerification';

/** Selo vindo de plano (pagamento ou renovação). Uma suspensão do selo feita pelo admin é mantida. */
export async function verifyPartnerApplicationUseCase(
  partnerId: string,
  isVerified: boolean,
  verifiedUntil: string | null,
  verificationType: PartnerVerificationType
): Promise<void> {
  const previous = await getPartnerProfileUseCase(partnerId);

  if (!previous) {
    throw new Error('Perfil de parceiro não encontrado.');
  }

  await applyPartnerVerification(
    partnerId,
    {
      isVerified,
      verifiedUntil,
      verificationType,
      isVerificationSuspended: isVerified ? previous.isVerificationSuspended : false,
    },
    previous
  );
}
