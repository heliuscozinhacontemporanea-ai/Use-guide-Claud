import { gateStaffAdapter } from '../../factory';

export function removeGateStaffUseCase(memberId: string): Promise<void> {
  return gateStaffAdapter.removeGateStaff(memberId);
}
