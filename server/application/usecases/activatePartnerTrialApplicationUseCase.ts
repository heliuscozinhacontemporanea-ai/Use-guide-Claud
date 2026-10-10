import {
  getPartnerProfileUseCase,
  activatePartnerTrialUseCase,
  restorePartnerTrialStateUseCase,
} from '../../domain/partners';
import { updateOwnerVerificationUseCase } from '../../domain/guide';
import { updateEventsOwnerVerificationUseCase } from '../../domain/events';

export async function activatePartnerTrialApplicationUseCase(
  actor: {
    uid: string;
    admin?: boolean;
  },
  partnerId: string
): Promise<void> {
  const previous = await getPartnerProfileUseCase(partnerId);

  if (!previous) {
    throw new Error('Perfil de parceiro não encontrado.');
  }

  const verifiedUntil = await activatePartnerTrialUseCase(actor, partnerId);

  try {
    const verification = {
      isVerified: true,
      verifiedUntil,
      verificationType: 'trial' as const,
      isVerificationSuspended: false,
    };
    await updateOwnerVerificationUseCase(partnerId, verification);
    await updateEventsOwnerVerificationUseCase(partnerId, verification);
  } catch (error) {
    try {
      await restorePartnerTrialStateUseCase(partnerId, {
        hasUsedTrial: previous.hasUsedTrial,
        isVerified: previous.isVerified,
        verifiedUntil: previous.verifiedUntil,
        verificationType: previous.verificationType,
        isVerificationSuspended: previous.isVerificationSuspended,
      });
    } catch (rollbackError) {
      console.error(
        '[activatePartnerTrialApplicationUseCase] Falha no rollback do trial:',
        rollbackError
      );
    }

    throw error;
  }
}
