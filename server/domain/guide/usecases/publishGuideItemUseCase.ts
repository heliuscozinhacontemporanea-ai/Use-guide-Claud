import type { AuthenticatedUserContext } from '../../../application/security/authenticatedUserContext';
import { guideService } from '../factory';

/** Publica o rascunho no guia; recusa com `LISTING_INCOMPLETE` se algum passo faltar (D34). */
export async function publishGuideItemUseCase(
  user: AuthenticatedUserContext,
  id: string
): Promise<void> {
  await guideService.publishItem(user, id);
}
