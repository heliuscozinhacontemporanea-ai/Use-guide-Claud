import { partnerHomeAdapter } from '../../factory';
import type { PartnerEventSales } from '../../types/partnerHome';

export function getPartnerEventSalesUseCase(eventId: string): Promise<PartnerEventSales> {
  return partnerHomeAdapter.getEventSales(eventId);
}
