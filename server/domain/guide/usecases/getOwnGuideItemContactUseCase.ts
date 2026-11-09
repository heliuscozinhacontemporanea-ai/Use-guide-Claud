import type { AuthenticatedUserContext } from '../../../application/security/authenticatedUserContext';
import { guideService } from '../factory';
import type { GuideItemContact } from '../ports/guidePort';

/** Telefone do próprio anúncio, para o editor do parceiro (só o dono ou admin). */
export function getOwnGuideItemContactUseCase(
  user: AuthenticatedUserContext,
  itemId: string
): Promise<GuideItemContact> {
  return guideService.getOwnItemContact(user, itemId);
}
