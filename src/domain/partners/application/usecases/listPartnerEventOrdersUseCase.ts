import { partnerHomeAdapter } from '../../factory';
import type { PartnerEventOrdersPage, PartnerEventOrdersQuery } from '../../types/partnerHome';

export function listPartnerEventOrdersUseCase(
  eventId: string,
  query: PartnerEventOrdersQuery
): Promise<PartnerEventOrdersPage> {
  return partnerHomeAdapter.listEventOrders(eventId, query);
}
