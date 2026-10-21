import { updateEstablishmentEventsVerificationUseCase } from '../../../domain/events';
import { updateItemVerificationUseCase } from '../../../domain/guide';
import {
  computeListingSealUseCase,
  getListingVerificationStatusUseCase,
  type ListingSeal,
  setListingSealActiveUseCase,
} from '../../../domain/partners';

/**
 * Recalcula o selo público do estabelecimento (plano + verificação, D11) e grava a cópia no item e
 * nos eventos dele. Chamado depois de toda mudança de plano, de selo do admin ou de verificação.
 */
export async function syncListingSealApplicationUseCase(itemId: string): Promise<ListingSeal> {
  const verification = await getListingVerificationStatusUseCase(itemId);
  const seal = await computeListingSealUseCase(itemId, verification);
  await updateItemVerificationUseCase(itemId, seal);
  await updateEstablishmentEventsVerificationUseCase(itemId, seal);
  await setListingSealActiveUseCase(itemId, seal.isVerified);
  return seal;
}
