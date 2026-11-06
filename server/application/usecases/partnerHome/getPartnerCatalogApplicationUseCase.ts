import { listEventOccurrencesUseCase, listOwnerEventListingsUseCase } from '../../../domain/events';
import { getSoldTicketsCountForOccurrenceApplicationUseCase } from '../getSoldTicketsCountForOccurrenceApplicationUseCase';
import { buildCatalogEvents, type PartnerCatalogEvent } from './buildCatalogEvents';

export interface PartnerCatalogView {
  events: PartnerCatalogEvent[];
}

/** Catálogo do painel (p09): eventos do dono com sessões, próxima data e vendidos. */
export async function getPartnerCatalogApplicationUseCase(
  ownerUid: string,
  now: Date = new Date()
): Promise<PartnerCatalogView> {
  const actor = { uid: ownerUid, admin: false, role: 'partner' as const };
  const events = await listOwnerEventListingsUseCase(ownerUid);
  const inputs = await Promise.all(
    events
      .filter((event) => event.status !== 'archived')
      .map(async (event) => {
        const occurrences = await listEventOccurrencesUseCase(event.id);
        const counts = await Promise.all(
          occurrences
            .filter((occurrence) => occurrence.status !== 'canceled')
            .map((occurrence) =>
              getSoldTicketsCountForOccurrenceApplicationUseCase(actor, occurrence.id)
            )
        );
        return { event, occurrences, sold: counts.reduce((sum, count) => sum + count, 0) };
      })
  );
  return { events: buildCatalogEvents(inputs, now.toISOString()) };
}
