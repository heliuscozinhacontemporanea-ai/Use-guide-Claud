import { gateStaffAdapter } from '../../factory';

export function respondGateInviteUseCase(memberId: string, accept: boolean): Promise<void> {
  return gateStaffAdapter.respondGateInvite(memberId, accept);
}
