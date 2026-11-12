import { gateStaffAdapter } from '../../factory';
import type { GateScopeType } from '../../types/gateStaff';

export function inviteGateStaffUseCase(
  target: { type: GateScopeType; id: string },
  username: string
): Promise<void> {
  return gateStaffAdapter.inviteGateStaff(target, username);
}
