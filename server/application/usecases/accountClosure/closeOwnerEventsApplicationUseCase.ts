import {
  deleteOrArchiveEventListingUseCase,
  listOwnerEventListingsUseCase,
} from '../../../domain/events';
import { hasEventCommercialHistoryApplicationUseCase } from '../hasEventCommercialHistoryApplicationUseCase';

/**
 * Conta ou perfil de parceiro encerrado: evento com vendas no histórico fica arquivado (o registro
 * financeiro continua guardado, §7.5); evento sem vendas é apagado com as sessões.
 */
export async function closeOwnerEventsApplicationUseCase(ownerUid: string): Promise<void> {
  const actor = { uid: ownerUid, admin: false };
  for (const event of await listOwnerEventListingsUseCase(ownerUid)) {
    if (event.status === 'archived') continue;
    const hasHistory = await hasEventCommercialHistoryApplicationUseCase(actor, event.id);
    await deleteOrArchiveEventListingUseCase(actor, event.id, hasHistory);
  }
}
