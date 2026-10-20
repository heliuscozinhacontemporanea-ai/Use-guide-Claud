import { getListingVerificationService } from '../factory';

export function deleteOwnerListingVerificationsUseCase(ownerId: string): Promise<string[]> {
  return getListingVerificationService().deleteForOwner(ownerId);
}
