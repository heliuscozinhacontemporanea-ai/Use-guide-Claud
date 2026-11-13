import { gateStaffAdapter } from '../../factory';

export function leaveGateUseCase(memberId: string): Promise<void> {
  return gateStaffAdapter.leaveGate(memberId);
}
