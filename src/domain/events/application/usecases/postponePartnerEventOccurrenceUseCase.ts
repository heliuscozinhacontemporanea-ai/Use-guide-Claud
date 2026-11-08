import { eventsAdapter } from '../../factory';

/** Os ingressos valem na nova data; o comprador tem 7 dias para pedir reembolso integral (D16). */
export async function postponePartnerEventOccurrenceUseCase(
  eventListingId: string,
  occurrenceId: string,
  replacement: { startsAt: string; endsAt: string; reason: string }
): Promise<void> {
  return eventsAdapter.postponePartnerEventOccurrence(eventListingId, occurrenceId, replacement);
}
