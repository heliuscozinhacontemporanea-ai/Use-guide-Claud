import { gateStaffAdapter } from '../../factory';

export function inviteGateStaffUseCase(eventListingId: string, username: string): Promise<void> {
  return gateStaffAdapter.inviteGateStaff(eventListingId, username);
}
