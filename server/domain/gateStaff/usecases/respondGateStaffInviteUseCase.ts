import { getGateStaffService } from '../factory';
import type { GateStaffMember } from '../types/gateStaffTypes';

/** Aceite ou recusa do convite, só pela pessoa convidada. */
export function respondGateStaffInviteUseCase(
  staffUid: string,
  id: string,
  accept: boolean
): Promise<GateStaffMember> {
  return getGateStaffService().respond(staffUid, id, accept);
}
