import {
  type PartnerProfileDocument,
  type PartnerVerificationData,
  updatePartnerVerificationProfileUseCase,
} from '../../domain/partners';
import { updateOwnerVerificationUseCase } from '../../domain/guide';
import { updateEventsOwnerVerificationUseCase } from '../../domain/events';

/** Grava o selo no parceiro e replica nos itens e eventos dele; desfaz no parceiro se a réplica falhar. */
export async function applyPartnerVerification(
  partnerId: string,
  verification: PartnerVerificationData,
  previous: PartnerProfileDocument
): Promise<void> {
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
      console.error('[applyPartnerVerification] Falha no rollback do Partner:', rollbackError);
    }

    throw error;
  }
}
