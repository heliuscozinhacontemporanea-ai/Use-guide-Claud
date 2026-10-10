import { AuthenticatedUserContext } from '../security/authenticatedUserContext';
import { createGuideItemUseCase, deleteGuideItemUseCase } from '../../domain/guide';
import type { GuideCreateItemInput } from '../../domain/guide';
import { linkBusinessUseCase } from '../../domain/partners';

export async function createPartnerItemApplicationUseCase(
  user: AuthenticatedUserContext,
  data: GuideCreateItemInput
): Promise<string> {
  const itemId = await createGuideItemUseCase(user, data);
  try {
    await linkBusinessUseCase(user.uid, {
      businessId: itemId,
      businessName: data.name,
      type: 'item',
    });
  } catch (error) {
    try {
      await deleteGuideItemUseCase(user, itemId);
    } catch (rollbackError) {
      console.error(
        '[createPartnerItemApplicationUseCase] Falha no rollback do item:',
        rollbackError
      );
    }
    throw error;
  }
  return itemId;
}
