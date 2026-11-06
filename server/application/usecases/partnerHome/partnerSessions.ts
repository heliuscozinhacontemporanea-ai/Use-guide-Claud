import {
  type EventOccurrence,
  listEventOccurrencesUseCase,
  listOwnerEventListingsUseCase,
} from '../../../domain/events';
import { getSoldTicketsCountForOccurrenceApplicationUseCase } from '../getSoldTicketsCountForOccurrenceApplicationUseCase';
import type { PartnerSessionInput } from './buildPartnerHome';

export type OwnerEvent = Awaited<ReturnType<typeof listOwnerEventListingsUseCase>>[number];

/** Sessões não canceladas dos eventos do dono, com o evento de cada uma. */
export async function listOwnerOccurrences(
  events: OwnerEvent[]
): Promise<Array<{ event: OwnerEvent; occurrence: EventOccurrence }>> {
  return (
    await Promise.all(
      events.map(async (event) =>
        (
          await listEventOccurrencesUseCase(event.id)
        )
          .filter((occurrence) => occurrence.status !== 'canceled')
          .map((occurrence) => ({ event, occurrence }))
      )
    )
  ).flat();
}

/** Sessão com o vendido (ingressos pagos e reservados) lido da gestão de ingressos. */
export async function toSessionInput(
  ownerUid: string,
  { event, occurrence }: { event: OwnerEvent; occurrence: EventOccurrence }
): Promise<PartnerSessionInput> {
  return {
    id: occurrence.id,
    eventId: event.id,
    eventTitle: event.title || event.name,
    establishmentId: event.establishmentId ?? null,
    startsAt: occurrence.startsAt,
    endsAt: occurrence.endsAt ?? null,
    capacity: occurrence.capacity,
    sold: await getSoldTicketsCountForOccurrenceApplicationUseCase(
      { uid: ownerUid, admin: false, role: 'partner' },
      occurrence.id
    ),
  };
}
