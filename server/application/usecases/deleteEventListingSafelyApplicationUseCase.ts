import { deleteOrArchiveEventListingUseCase, EventHasSalesError } from '../../domain/events';
import type { TicketingActorContext } from '../../domain/ticketing';
import { hasEventCommercialHistoryApplicationUseCase } from './hasEventCommercialHistoryApplicationUseCase';
import { cancelEventListingAndRefundApplicationUseCase } from './cancelEventListingAndRefundApplicationUseCase';

export async function deleteEventListingSafelyApplicationUseCase(
  actor: TicketingActorContext,
  eventListingId: string
): Promise<{ mode: 'deleted' | 'archived' }> {
  const hasCommercialHistory = await hasEventCommercialHistoryApplicationUseCase(
    actor,
    eventListingId
  );
  if (hasCommercialHistory && !actor.admin) {
    // Com vendas, o parceiro cancela cada sessão pela folha da sessão, que mostra reembolso e
    // multa antes de confirmar (D14, D27). Excluir aqui cobraria a multa sem aviso.
    throw new EventHasSalesError();
  }
  if (hasCommercialHistory) {
    await cancelEventListingAndRefundApplicationUseCase(
      actor,
      eventListingId,
      'Evento encerrado/arquivado com histórico comercial.'
    );
  }
  return deleteOrArchiveEventListingUseCase(actor, eventListingId, hasCommercialHistory);
}
