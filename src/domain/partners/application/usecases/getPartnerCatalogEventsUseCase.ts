import { partnerHomeAdapter } from '../../factory';
import type { PartnerCatalogEvent } from '../../types/partnerHome';

export function getPartnerCatalogEventsUseCase(): Promise<PartnerCatalogEvent[]> {
  return partnerHomeAdapter.getCatalogEvents();
}
