import { getGateStaffService } from '../factory';
import type { GateStaffMember } from '../types/gateStaffTypes';

/** Equipes e convites da pessoa. */
export function listMyGateStaffUseCase(staffUid: string): Promise<GateStaffMember[]> {
  return getGateStaffService().listForStaff(staffUid);
}
