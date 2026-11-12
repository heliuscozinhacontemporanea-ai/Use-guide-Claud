import { getGateStaffService } from '../factory';
import type { GateStaffMember } from '../types/gateStaffTypes';

/** A pessoa sai da equipe por conta própria. */
export function leaveGateStaffUseCase(staffUid: string, id: string): Promise<GateStaffMember> {
  return getGateStaffService().leave(staffUid, id);
}
