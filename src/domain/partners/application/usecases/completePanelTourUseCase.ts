import { partnerHomeAdapter } from '../../factory';

export function completePanelTourUseCase(): Promise<void> {
  return partnerHomeAdapter.completeTour();
}
