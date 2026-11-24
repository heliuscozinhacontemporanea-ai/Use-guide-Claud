import { guideService } from '../factory';
import { AuthenticatedUserContext } from '../../../shared/kernel/authenticatedUserContext';
import { GuideUpdateItemInput } from '../types/guideTypes';

export async function updateGuideItemUseCase(
  user: AuthenticatedUserContext,
  id: string,
  data: GuideUpdateItemInput
): Promise<void> {
  return guideService.updateItem(user, id, data);
}
