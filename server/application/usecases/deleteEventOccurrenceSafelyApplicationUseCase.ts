import { deleteEventOccurrenceUseCase, OccurrenceHasSalesError } from '../../domain/events';
import type { TicketingActorContext } from '../../domain/ticketing';
import { getCommittedTicketsCountForOccurrenceApplicationUseCase } from './getCommittedTicketsCountForOccurrenceApplicationUseCase';
import { cancelEventOccurrenceAndRefundApplicationUseCase } from './cancelEventOccurrenceAndRefundApplicationUseCase';

export async function deleteEventOccurrenceSafelyApplicationUseCase(
  actor: TicketingActorContext,
  occurrenceId: string
): Promise<{ mode: 'deleted' | 'canceled' }> {
  const committedCount = await getCommittedTicketsCountForOccurrenceApplicationUseCase(
    actor,
    occurrenceId
  );
  const hasCommercialHistory = committedCount > 0;
  if (hasCommercialHistory && !actor.admin) {
    // Com vendas ou cortesias, o parceiro cancela ou adia pela folha da sessão, que mostra
    // reembolso e multa antes de confirmar (D14, D27). Excluir aqui cobraria a multa sem aviso.
    throw new OccurrenceHasSalesError();
  }
  if (hasCommercialHistory) {
    await cancelEventOccurrenceAndRefundApplicationUseCase(
      actor,
      occurrenceId,
      'Sessão cancelada por exclusão com histórico comercial.'
    );
    return { mode: 'canceled' };
  }
  return deleteEventOccurrenceUseCase(actor, occurrenceId, false);
}
