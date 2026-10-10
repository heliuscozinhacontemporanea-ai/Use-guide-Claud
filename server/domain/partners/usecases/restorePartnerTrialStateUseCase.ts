import { partnerService } from '../factory';
import type { PartnerTrialState } from '../types/partnerTypes';

export async function restorePartnerTrialStateUseCase(
  partnerId: string,
  state: PartnerTrialState
): Promise<void> {
  return partnerService.restoreTrialState(partnerId, state);
}
