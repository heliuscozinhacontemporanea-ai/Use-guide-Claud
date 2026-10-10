import {
  getPartnerProfileUseCase,
  updatePartnerVerificationProfileUseCase,
} from '../../domain/partners';
import { updateOwnerVerificationUseCase } from '../../domain/guide';
import { updateEventsOwnerVerificationUseCase } from '../../domain/events';
import type { PartnerVerificationType } from '../../domain/partners';

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

  const verification = {
    isVerified,
    verifiedUntil,
    verificationType,
    isVerificationSuspended: false,
  };

  await updatePartnerVerificationProfileUseCase(partnerId, verification);

  try {
    await updateOwnerVerificationUseCase(partnerId, verification);
    await updateEventsOwnerVerificationUseCase(partnerId, verification);
  } catch (error) {
    try {
      await updatePartnerVerificationProfileUseCase(partnerId, {
        isVerified: previous.isVerified,
        verifiedUntil: previous.verifiedUntil,
        verificationType: previous.verificationType,
        isVerificationSuspended: previous.isVerificationSuspended,
      });
    } catch (rollbackError) {
      console.error(
        '[verifyPartnerApplicationUseCase] Falha no rollback do Partner:',
        rollbackError
      );
    }

    throw error;
  }
}
