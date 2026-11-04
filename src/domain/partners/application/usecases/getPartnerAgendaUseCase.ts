import { partnerHomeAdapter } from '../../factory';
import type { PartnerTodayItem } from '../../types/partnerHome';

export function getPartnerAgendaUseCase(
  fromIso: string,
  toIso: string
): Promise<PartnerTodayItem[]> {
  return partnerHomeAdapter.getAgenda(fromIso, toIso);
}
