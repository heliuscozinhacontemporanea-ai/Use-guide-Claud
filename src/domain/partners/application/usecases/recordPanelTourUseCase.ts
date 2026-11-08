import { partnerHomeAdapter } from '../../factory';

export function recordPanelTourUseCase(action: 'shown' | 'done' | 'tips_off'): Promise<void> {
  return partnerHomeAdapter.recordTour(action);
}
