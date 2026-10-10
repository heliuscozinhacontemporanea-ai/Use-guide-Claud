import { partnerService } from '../factory';

export async function activatePartnerTrialUseCase(
  actor: { uid: string; admin?: boolean },
  partnerId: string
): Promise<string> {
  return partnerService.activateTrial(actor, partnerId);
}
