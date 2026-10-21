import { eventsService } from '../factory';

export async function updateEstablishmentEventsVerificationUseCase(
  establishmentId: string,
  verification: {
    isVerified: boolean;
    verifiedUntil: string | null;
    verificationType: 'trial' | 'monthly' | 'semi-annual' | 'annual' | 'admin' | null;
    isVerificationSuspended: boolean;
  }
): Promise<void> {
  return eventsService.updateEstablishmentVerification(establishmentId, verification);
}
