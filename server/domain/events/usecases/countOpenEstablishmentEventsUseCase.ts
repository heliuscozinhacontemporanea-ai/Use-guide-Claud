import { eventsService } from '../factory';

/** Eventos do estabelecimento que ainda não foram arquivados: impedem excluir o anúncio (D34). */
export async function countOpenEstablishmentEventsUseCase(
  establishmentId: string
): Promise<number> {
  return eventsService.countOpenEstablishmentEvents(establishmentId);
}
