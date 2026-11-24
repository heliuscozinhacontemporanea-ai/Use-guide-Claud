import { AuthenticatedUserContext } from '../../shared/kernel/authenticatedUserContext';
import {
  createGuideItemUseCase,
  deleteGuideItemUseCase,
  listOwnerGuideItemsUseCase,
} from '../../domain/guide';
import type { GuideCreateItemInput } from '../../domain/guide';
import { recordPartnerPanelTourUseCase } from '../../domain/partners';
import { USE_GUIDE_OWNER_ID } from '../../shared/kernel/useGuideOwner';
import { linkOwnerBusiness } from './ownerBusinessLink';

/**
 * Quem acabou de entrar pelo Seja parceiro segue o guia de passos do Início, e não o tour (escolhas
 * da F1, D34): o primeiro anúncio da conta marca o tour como visto. Falha aqui não desfaz o cadastro.
 */
async function skipTourForNewPartner(uid: string): Promise<void> {
  try {
    const items = await listOwnerGuideItemsUseCase(uid);
    if (items.length === 1) await recordPartnerPanelTourUseCase(uid, 'done');
  } catch (error) {
    console.error('[createPartnerItemApplicationUseCase] Tour não marcado como visto', {
      name: error instanceof Error ? error.name : 'UnknownError',
    });
  }
}

export async function createPartnerItemApplicationUseCase(
  user: AuthenticatedUserContext,
  data: GuideCreateItemInput
): Promise<string> {
  const itemId = await createGuideItemUseCase(user, data);
  // O admin cadastra para o Use Guide (escolhas da F4); só o parceiro liga o anúncio ao perfil.
  const ownerId = user.admin ? USE_GUIDE_OWNER_ID : user.uid;
  try {
    await linkOwnerBusiness(ownerId, {
      businessId: itemId,
      businessName: data.name,
      type: 'item',
    });
  } catch (error) {
    try {
      await deleteGuideItemUseCase(user, itemId);
    } catch (rollbackError) {
      console.error('[createPartnerItemApplicationUseCase] Falha no rollback do item', {
        name: rollbackError instanceof Error ? rollbackError.name : 'UnknownError',
      });
    }
    throw error;
  }
  if (!user.admin) await skipTourForNewPartner(user.uid);
  return itemId;
}
