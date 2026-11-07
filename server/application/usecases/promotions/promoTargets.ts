import { listEventOccurrencesUseCase, listOwnerEventListingsUseCase } from '../../../domain/events';
import { listTicketTypesForManagementUseCase } from '../../../domain/ticketing';

/** Evento que pode receber cupom, com os lotes de cada sessão. */
export interface PromoEventTarget {
  id: string;
  title: string;
  status: string;
  options: Array<{ id: string; name: string; sessionStartsAt: string }>;
}

/** Eventos do dono (sem os arquivados) e os lotes das sessões que não foram canceladas. */
export async function loadOwnerEventTargets(ownerUid: string): Promise<PromoEventTarget[]> {
  const actor = { uid: ownerUid, admin: false, role: 'partner' as const };
  const events = await listOwnerEventListingsUseCase(ownerUid);
  return Promise.all(
    events
      .filter((event) => event.status !== 'archived')
      .map(async (event) => {
        const occurrences = (await listEventOccurrencesUseCase(event.id)).filter(
          (occurrence) => occurrence.status !== 'canceled'
        );
        const options = await Promise.all(
          occurrences.map(async (occurrence) =>
            (await listTicketTypesForManagementUseCase(actor, occurrence.id)).map((type) => ({
              id: type.id,
              name: type.name,
              sessionStartsAt: occurrence.startsAt,
            }))
          )
        );
        return {
          id: event.id,
          title: event.title || event.name,
          status: event.status,
          options: options
            .flat()
            .sort((a, b) => a.sessionStartsAt.localeCompare(b.sessionStartsAt)),
        };
      })
  );
}
