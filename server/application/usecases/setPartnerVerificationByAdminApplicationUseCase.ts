import {
  getPartnerProfileUseCase,
  PartnerDomainError,
  resolveAdminVerification,
} from '../../domain/partners';
import { applyPartnerVerification } from './applyPartnerVerification';

/** Admin concede ou retira o selo sem alterar o plano pago do parceiro. */
export async function setPartnerVerificationByAdminApplicationUseCase(
  partnerId: string,
  grant: boolean,
  now: Date = new Date()
): Promise<void> {
  const previous = await getPartnerProfileUseCase(partnerId);
  if (!previous) {
    throw new PartnerDomainError('NOT_FOUND', 'Perfil de parceiro não encontrado');
  }

  const next = resolveAdminVerification(
    {
      isVerified: previous.isVerified,
      verifiedUntil: previous.verifiedUntil,
      verificationType: previous.verificationType,
      isVerificationSuspended: previous.isVerificationSuspended,
    },
    grant,
    now
  );

  await applyPartnerVerification(partnerId, next, previous);
}
