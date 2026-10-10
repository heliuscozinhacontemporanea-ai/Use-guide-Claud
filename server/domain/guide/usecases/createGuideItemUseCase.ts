import { guideService } from '../factory';
import { AuthenticatedUserContext } from '../../../application/security/authenticatedUserContext';
import { GuideCreateItemInput } from '../types/guideTypes';

export async function createGuideItemUseCase(
  user: AuthenticatedUserContext,
  data: GuideCreateItemInput & { id?: string }
): Promise<string> {
  return guideService.createItem(user, data);
}
