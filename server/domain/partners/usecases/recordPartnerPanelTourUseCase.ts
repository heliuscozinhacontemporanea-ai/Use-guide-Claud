import { partnerService } from '../factory';
import type { PanelTourAction } from '../types/panelTour';

export function recordPartnerPanelTourUseCase(
  partnerId: string,
  action: PanelTourAction
): Promise<void> {
  return partnerService.recordPanelTour(partnerId, action);
}
