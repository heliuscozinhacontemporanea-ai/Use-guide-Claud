import { getGateStaffService } from '../factory';
import type { GateScope, GateStaffMember } from '../types/gateStaffTypes';

/** Convite para a portaria; quem chama já conferiu que o evento ou a atração é do dono. */
export function inviteGateStaffUseCase(
  ownerId: string,
  scope: GateScope,
  staff: { uid: string; username: string | null; displayName: string | null }
): Promise<GateStaffMember> {
  return getGateStaffService().invite(ownerId, scope, staff);
}
