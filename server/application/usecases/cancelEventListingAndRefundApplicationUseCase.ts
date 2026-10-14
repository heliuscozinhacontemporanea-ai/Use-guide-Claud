import {
  archiveEventListingUseCase,
  listEventOccurrencesUseCase,
  type EventListing,
  type EventOccurrence,
} from '../../domain/events';
import type { TicketingActorContext } from '../../domain/ticketing';
import { cancelEventOccurrenceAndRefundApplicationUseCase } from './cancelEventOccurrenceAndRefundApplicationUseCase';

export async function cancelEventListingAndRefundApplicationUseCase(
  actor: TicketingActorContext,
  eventListingId: string,
  reason = 'Evento cancelado pela organização.'
): Promise<{
  listing: EventListing;
  canceledOccurrences: EventOccurrence[];
  refundsCount: number;
}> {
  const occurrences = await listEventOccurrencesUseCase(eventListingId);
  const canceledOccurrences: EventOccurrence[] = [];
  let refundsCount = 0;

  for (const occ of occurrences) {
    if (occ.status === 'scheduled' || occ.status === 'postponed') {
      const res = await cancelEventOccurrenceAndRefundApplicationUseCase(actor, occ.id, reason);
      canceledOccurrences.push(res.occurrence);
      refundsCount += res.refundsInitiated.length;
    }
  }

  const listing = await archiveEventListingUseCase(actor, eventListingId);
  return { listing, canceledOccurrences, refundsCount };
}
