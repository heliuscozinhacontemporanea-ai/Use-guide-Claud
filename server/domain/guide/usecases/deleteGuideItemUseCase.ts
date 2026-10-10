import { guideService } from '../factory';
import { AuthenticatedUserContext } from '../../../application/security/authenticatedUserContext';

export async function deleteGuideItemUseCase(
  user: AuthenticatedUserContext,
  id: string
): Promise<void> {
  return guideService.deleteItem(user, id);
}
