import { partnerService } from '../factory';
import type { PanelTourState } from '../types/panelTour';

export function getPartnerPanelTourUseCase(partnerId: string): Promise<PanelTourState> {
  return partnerService.getPanelTour(partnerId);
}
