import { promoterService } from '../factory';
import type { EventPromotersSummary } from '../services/promoterService';
import type { TicketingActorContext } from '../services/ticketingAccess';

/** Divulgadores do evento com vendas e quanto o organizador deve (p16). */
export function getEventPromotersUseCase(
  actor: TicketingActorContext,
  eventListingId: string
): Promise<EventPromotersSummary> {
  return promoterService.eventSummary(actor, eventListingId);
}
