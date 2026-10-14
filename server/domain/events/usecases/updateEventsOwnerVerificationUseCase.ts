import { eventsService } from '../factory';

export async function updateEventsOwnerVerificationUseCase(
  ownerId: string,
  verification: {
    isVerified: boolean;
    verifiedUntil: string | null;
    verificationType: 'trial' | 'monthly' | 'semi-annual' | 'annual' | null;
    isVerificationSuspended: boolean;
  }
): Promise<void> {
  return eventsService.updateOwnerVerification(ownerId, verification);
}
