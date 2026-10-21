import { guideService } from '../factory';
import type { GuideVerificationUpdate } from '../ports/guidePort';

export async function updateItemVerificationUseCase(
  itemId: string,
  verification: GuideVerificationUpdate
): Promise<void> {
  await guideService.updateItemVerification(itemId, verification);
}
