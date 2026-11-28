import {
  updateEventListingUseCase,
  type EventListing,
  type UpdateEventListingInput,
} from '../../domain/events';
import { refreshEventCardSummaryUseCase, type TicketingActorContext } from '../../domain/ticketing';
import { hasEventCommercialHistoryApplicationUseCase } from './hasEventCommercialHistoryApplicationUseCase';

export async function updateEventListingSafelyApplicationUseCase(
  actor: TicketingActorContext,
  eventListingId: string,
  input: UpdateEventListingInput
): Promise<EventListing> {
  // Na dúvida, aplica as travas de quem já vendeu (ex.: não mudar preço de lote vendido).
  const hasCommercialHistory = await hasEventCommercialHistoryApplicationUseCase(
    actor,
    eventListingId
  ).catch(() => true);
  const updated = await updateEventListingUseCase(actor, eventListingId, input, {
    hasCommercialHistory,
  });
  // A taxa de serviço e a política entram no "a partir de" do cartão (D37 item 10). Falhar aqui não
  // desfaz a edição: o cartão se corrige na próxima mudança de lote.
  await refreshEventCardSummaryUseCase(eventListingId).catch((error: unknown) =>
    console.error('[events] resumo do cartão não atualizado', {
      eventListingId,
      message: error instanceof Error ? error.message : String(error),
    })
  );
  return updated;
}
