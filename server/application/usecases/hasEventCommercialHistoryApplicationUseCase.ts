import {
  listEventCheckInsForPartnerOrAdminUseCase,
  listEventOrdersForPartnerOrAdminUseCase,
  listEventRefundsForPartnerOrAdminUseCase,
  type TicketingActorContext,
} from '../../domain/ticketing';

export async function hasEventCommercialHistoryApplicationUseCase(
  actor: TicketingActorContext,
  eventListingId: string
): Promise<boolean> {
  try {
    const [orders, refunds, checkIns] = await Promise.all([
      listEventOrdersForPartnerOrAdminUseCase(actor, eventListingId),
      listEventRefundsForPartnerOrAdminUseCase(actor, eventListingId),
      listEventCheckInsForPartnerOrAdminUseCase(actor, eventListingId),
    ]);
    return orders.length > 0 || refunds.length > 0 || checkIns.length > 0;
  } catch {
    return false;
  }
}
