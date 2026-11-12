import {
  type EventOccurrence,
  listEventOccurrencesUseCase,
  listOwnerEventListingsUseCase,
} from '../../../domain/events';
import {
  countOccurrenceCourtesiesEnteredUseCase,
  countOccurrenceCourtesiesUseCase,
} from '../../../domain/ticketing';
import { getSoldTicketsCountForOccurrenceApplicationUseCase } from '../getSoldTicketsCountForOccurrenceApplicationUseCase';
import type { PartnerSessionInput } from './buildPartnerHome';

// A portaria do evento abre 2 h antes do início (D27).
const GATE_OPENS_BEFORE_MS = 2 * 60 * 60 * 1000;

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
  { event, occurrence }: { event: OwnerEvent; occurrence: EventOccurrence },
  /** Com a hora atual, conta também os convidados que já entraram (C7), só com a portaria aberta. */
  nowMs?: number
): Promise<PartnerSessionInput> {
  const courtesies = await countOccurrenceCourtesiesUseCase(occurrence.id).catch(() => 0);
  const gateOpened =
    nowMs !== undefined && nowMs >= new Date(occurrence.startsAt).getTime() - GATE_OPENS_BEFORE_MS;
  return {
    id: occurrence.id,
    eventId: event.id,
    eventTitle: event.title || event.name,
    establishmentId: event.establishmentId ?? null,
    startsAt: occurrence.startsAt,
    endsAt: occurrence.endsAt ?? null,
    salesEndsAt: occurrence.salesEndsAt || occurrence.startsAt,
    capacity: occurrence.capacity,
    sold: await getSoldTicketsCountForOccurrenceApplicationUseCase(
      { uid: ownerUid, admin: false, role: 'partner' },
      occurrence.id
    ),
    courtesies,
    courtesiesEntered:
      courtesies > 0 && gateOpened
        ? await countOccurrenceCourtesiesEnteredUseCase(occurrence.id).catch(() => 0)
        : 0,
  };
}
