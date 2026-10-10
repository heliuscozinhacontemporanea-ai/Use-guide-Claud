import { guideService } from '../factory';
import { GuideVerificationUpdate } from '../ports/guidePort';

export async function updateOwnerVerificationUseCase(
  ownerId: string,
  verification: GuideVerificationUpdate
): Promise<void> {
  await guideService.updateOwnerVerification(ownerId, verification);
}
